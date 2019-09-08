/**
 * AJAX后台、卖家中心公共组件
 */

(function($) {

	var lastUuid = 0;

	function uuid() {
		return (new Date()).getTime() * 1000 + (lastUuid++) % 1000;
	}

	$.upload = {
		defaults: {

		},
		setDefaults: function(settings) {
			this.defaults = $.extend(this.defaults, settings);
		}
	};

	/**
	 * 图片上传
	 * 
	 * @author niqingyang <niqy@qq.com>
	 */
	$.imageupload = function(settings) {

		var defaults = {
			url: '/site/upload-image',
			file: null,
			// 验证规则
			options: null,
			// 提交的数据
			data: {},
			// 上传后的回调函数
			// @params result 返回的数据
			callback: null
		};

		settings = $.extend(true, defaults, settings);

		if (settings.options) {
			if ($.isPlainObject(settings.options)) {
				settings.data.options = settings.options;
				settings.data.options = $.toJSON(settings.data.options);
			} else {
				console.error("$.imageupload()的opions必须为一个JS对象！");
			}
		}

		var fileElementId = "ajaxFileUpload_file_" + new Date().getTime();

		if (settings.file == null) {
			var element = $("<div style='display: none;'><input type='file' id='" + fileElementId + "' name='" + fileElementId + "'/></div>");
			$("body").append(element);
			$(element).find("#" + fileElementId).click();
		} else {
			if ($(settings.file).attr("id")) {
				$(settings.file).attr("id", fileElementId);
			} else {
				fileElementId = $(settings.file).attr("id");
			}
		}

		$("body").on("change", "#" + fileElementId, function() {
			$.ajaxFileUpload({
				url: settings.url,
				fileElementId: fileElementId,
				dataType: 'json',
				data: settings.data,
				success: function(result, status) {
					if (settings.file == null) {
						$(element).remove();
					}
					if ($.isFunction(settings.callback)) {
						settings.callback.call(settings, result);
					}
				}
			});
		});
	};

	// 手机端上传图片
	$.mobileimageupload = function(settings) {
		var defaults = {
			url: "/site/upload-image",
			file: null,
			// 提交的数据
			data: {},
			// 上传后的回调函数
			// @params result 返回的数据
			callback: null,
			width: 400,
			quality: 1,
		};

		settings = $.extend(true, defaults, settings);

		var fileElementId = "ajaxFileUpload_file_" + new Date().getTime();

		if (settings.file == null) {
			var element = $("<div style='display: none;'><input type='file' id='" + fileElementId + "' name='" + fileElementId + "' accept='image/*' capture='camera'/></div>");
			$("body").append(element);

			$("#" + fileElementId).localResizeIMG({
				width: settings.width,
				quality: settings.quality,
				success: function(result) {
					var submitData = {
						img_base64: result.clearBase64,
					};
					$.ajax({
						type: "POST",
						url: settings.url,
						data: submitData,
						dataType: "json",
						// 图片上传效果
						beforeSend: function() {
							$.loading.start();
						},
						success: function(result) {
							if ($.isFunction(settings.callback)) {
								settings.callback.call(settings, result);
								$.loading.stop();
							}
						},
						complete: function(XMLHttpRequest, textStatus) {
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) { // 上传失败
							$.msg(XMLHttpRequest.status);
							$.msg(XMLHttpRequest.readyState);
							$.msg(textStatus);
						}
					});
				},
			});

			$(element).find("#" + fileElementId).click();
		} else {
			if ($(settings.file).attr("id")) {
				$(settings.file).attr("id", fileElementId);
			} else {
				fileElementId = $(settings.file).attr("id");
			}
		}
	};

	/**
	 * 根据分页ID获取图片选择器对象
	 * 
	 * @param page_id
	 *            不为空则获取指定的控件对象，为空则获取全部的控件数组
	 * @return 控件或者undefined
	 * @author niqingyang <niqy@qq.com>
	 */
	$.imagegallerys = function(page_id) {
		if ($("body").data("imagegallerys") && page_id != undefined) {
			return $("body").data("imagegallerys")[page_id];
		}
		return $("body").data("imagegallerys");
	}

	/**
	 * 获取图片空间对象
	 */
	$.imagegallery = function(target) {
		if (target instanceof jQuery) {
			if ($(target).hasClass("szy-imagegallery")) {
				return $(target).data('szy.imagegallery');
			} else if ($(target).parents(".szy-imagegallery").size() > 0) {
				return $(target).parents(".szy-imagegallery").data('szy.imagegallery');
			} else {
				return $(target).data('szy.imagegallery');
			}
		}
		return null;
	}

	/**
	 * 图片空间
	 */
	$.fn.imagegallery = function(settings) {

		var defaults = {
			url: '/site/image-gallery',
			// 图片库展示的容器
			container: null,
			// 点击图片事件函数
			click: null,
			// Ajax提交参数
			data: {
				output: true,
				page: {
					// 分页的Id
					page_id: "ImageGalleryPage_" + uuid(),
					cur_page: 1,
					page_size: 12
				}
			},
			// 是否显示上传按钮
			open_upload: true,
			// 上传的回调函数
			callback: null
		}

		settings.container = $(this).first();
		settings = $.extend(true, defaults, settings);
		settings.data.url = settings.url;
		settings.data.open_upload = settings.open_upload ? 1 : 0;

		var container = $(settings.container);

		$.loading.start();

		$.ajax({
			url: settings.url,
			type: "GET",
			async: true,
			data: settings.data,
			dataType: "json",
			error: function(data) {
				// Ajax请求结束
				is_ajax_loading = false;

				if (top.loading) {
					// 停止显示加载进度条
					top.loading.stop();
				}

				alert("失败" + data.status);
			},
			success: function(result) {

				$.loading.stop();

				if (result.code == 0) {
					$(container).html(result.data);
				} else if (result.message) {

				}
			}
		});

		// 为图片绑定点击事件
		$(container).on("click", ".image-item", function() {
			$(container).find("li").removeClass("active");
			settings.click.call(settings, this, $(this).data("path"), $(this).data("url"));
			$(this).parents("li:first").addClass("active");
		});

		// 刷新
		if (!$("body").data("imagegallerys")) {
			$("body").data("imagegallerys", {});
		}
		$("body").data("imagegallerys")[settings.data.page.page_id] = this;

		$(container).addClass("szy-imagegallery");
		$(container).data("szy.imagegallery", settings);

		return settings;
	}

	/**
	 * 根据分页ID获取商品选择器对象
	 * 
	 * @param page_id
	 *            不为空则获取指定的控件对象，为空则获取全部的空间数组
	 * @return 控件或者undefined
	 */
	$.goodspickers = function(page_id) {
		if ($("body").data("goodspickers") && page_id != undefined) {
			return $("body").data("goodspickers")[page_id];
		}
		return $("body").data("goodspickers");
	}

	/**
	 * 获取商品选择器对象
	 */
	$.goodspicker = function(target) {
		if (target instanceof jQuery) {
			if ($(target).hasClass("szy-goodspicker")) {
				return $(target).data('szy.goodspicker');
			} else if ($(target).parents(".szy-goodspicker").size() > 0) {
				return $(target).parents(".szy-goodspicker").data('szy.goodspicker');
			} else {
				return $(target).data('szy.goodspicker');
			}
		}
		return null;
	}

	/**
	 * 商品选择器
	 * 
	 * @author niqingyang <niqy@qq.com>
	 */
	$.fn.goodspicker = function(settings) {

		var defaults = {
			url: '/goods/default/picker',
			// 选择器的容器
			container: null,
			// 是否是SKU商品
			is_sku: 1,
			// 选择商品和未选择商品的按钮单击事件
			// @param selected 点击是否选中
			// @param sku 选中的SKU对象或者SPU对象
			// @return 返回false代表
			click: null,
			// 组件AJAX加载完成后的回调函数
			callback: null,
			// Ajax提交参数
			data: {
				// 第一次显示

				// 排除的SKU编号
				except_sku_ids: undefined,
				output: true,
				left: 'col-sm-0',
				right: 'col-sm-12',
				page: {
					// 分页ID
					page_id: "GoodsPickerPage_" + uuid(),
					// 默认当前页
					cur_page: 1,
					// 每页显示的记录数
					page_size: 5,
					// 每页显示的下拉列表
					page_size_list: [5, 10, 15, 20]
				},
				// 默认为出售中的商品
				goods_status: 1,
				// 是否为SKU商品
				is_sku: 1,
				// 是否为批发商
				is_supply: 0
			},
			// 被选中的商品、SKU列表<goods_id-sku_id>
			values: [],
			sku_ids: [],
			goods_ids: [],
			// 刷新被选中的数据
			refreshSelectedData: function() {

				var hashSet = [];

				var sku_ids = [];

				var values = [];

				for (key in this.values) {
					var sku_id = this.values[key].sku_id + "";
					var goods_id = this.values[key].goods_id + "";
					if (this.is_sku == 1) {
						values[goods_id + "-" + sku_id] = {
							goods_id: goods_id,
							sku_id: sku_id
						};
					} else {
						values[goods_id] = {
							goods_id: goods_id,
							sku_id: sku_id
						};
					}
				}

				this.values = values;

				for (key in this.values) {
					var value = this.values[key];
					if (value != undefined && hashSet["sku_" + value.sku_id] == undefined) {
						sku_ids.push(value.sku_id);
						hashSet["sku_" + value.sku_id] = true;
					}
				}

				this.sku_ids = sku_ids;

				hashSet = []

				var goods_ids = [];
				for (key in this.values) {
					var value = this.values[key];
					if (value != undefined && hashSet["goods_" + value.goods_id] == undefined) {
						goods_ids.push(value.goods_id);
						hashSet["goods_" + value.goods_id] = true;
					}
				}

				this.goods_ids = goods_ids;

				if (this.is_sku == 1) {
					// 设置被选中的数量
					$(this.container).find(".selected_number").html(this.sku_ids.length);
				} else {
					// 设置被选中的数量
					$(this.container).find(".selected_number").html(this.goods_ids.length);
				}

				$(this.container).addClass("szy-goodspicker");
				$(this.container).data("szy.goodspicker", this);

				// 刷新
				if (!$("body").data("goodspickers")) {
					$("body").data("goodspickers", {});
				}
				$("body").data("goodspickers")[this.data.page.page_id] = this;
			},
			// 取消选择指定的SKU商品
			remove: function(goods_id, sku_id) {

				goods_id = goods_id + "";
				sku_id = sku_id + "";

				// 删除数据
				if (this.is_sku == 1) {
					delete this.values[goods_id + "-" + sku_id];
				} else {
					delete this.values[goods_id];
				}

				// 刷新选择的数据
				this.refreshSelectedData();

				// 渲染页面
				this.render(false, goods_id, sku_id);
			},
			add: function(goods_id, sku_id) {

				goods_id = goods_id + "";
				sku_id = sku_id + "";

				// 添加数据
				if (this.is_sku == 1) {
					this.values[goods_id + "-" + sku_id] = {
						goods_id: goods_id,
						sku_id: sku_id,
					};
				} else {
					this.values[goods_id] = {
						goods_id: goods_id,
						sku_id: sku_id,
					};
				}

				// 刷新选择的数据
				this.refreshSelectedData();

				// 渲染页面
				this.render(true, goods_id, sku_id);

			},
			// 渲染页面
			render: function(selected, goods_id, sku_id) {
				var target = $(this.container).find(".btn-goodspicker[data-sku-id='" + sku_id + "']").filter(".btn-goodspicker[data-goods-id='" + goods_id + "']");

				if (target.size() > 0) {

					var html = null;

					if (selected == true) {
						html = $(container).find("#btn_checked_template").html();
					} else {
						html = $(container).find("#btn_unchecked_template").html();
					}

					var element = $($.parseHTML(html));
					$(element).attr("data-sku-id", sku_id);
					$(element).attr("data-goods-id", goods_id);

					$(target).replaceWith(element);

				}
			}

		}

		settings.container = $(this).first();
		settings = $.extend(true, defaults, settings);
		settings.data.url = settings.url;

		var is_sku = settings.data.is_sku == 1 ? 1 : 0;
		settings.is_sku = is_sku;

		// 刷新数据
		settings.refreshSelectedData();

		// 设置已选择的数据
		if (settings.sku_ids.length > 0) {
			settings.data.sku_ids = settings.sku_ids;
		}
		if (settings.goods_ids.length > 0) {
			settings.data.goods_ids = settings.goods_ids;
		}

		var container = $(settings.container);

		$(container).addClass("szy-goodspicker");
		$(container).data("szy.goodspicker", settings);

		if (!$("body").data("goodspickers")) {
			$("body").data("goodspickers", {});
		}
		$("body").data("goodspickers")[settings.data.page.page_id] = settings;

		$.loading.start();

		$.ajax({
			url: settings.url,
			type: "GET",
			async: true,
			data: settings.data,
			dataType: "json",
			error: function(data) {

				$.loading.stop();

				// Ajax请求结束
				is_ajax_loading = false;

				if (top.loading) {
					// 停止显示加载进度条
					top.loading.stop();
				}

				alert("失败" + data.status);
			},
			success: function(result) {

				$.loading.stop();

				if (result.code == 0) {
					$(container).html(result.data);
				} else if (result.message) {
					if ($.isFunction($.msg)) {
						$.msg(result.message, {
							time: 5000
						});
					} else {
						alert(result.message);
					}
				}

				// 刷新数据
				settings.refreshSelectedData();

				if ($.isFunction(settings.callback)) {
					settings.callback.call(settings);
				}
			}
		});

		// 单击选择、已选择按钮的事件
		$(container).on("click", ".btn-goodspicker", function() {

			// 获取数据
			var sku_id = $(this).data("sku-id");
			var goods_id = $(this).data("goods-id");
			var selected = $(this).data("selected") == true ? false : true;

			// 必须放在这里否则有问题
			var sku = $(this).parents(".sku-item").serializeJson();

			if (selected == true) {
				// 添加数据
				settings.add(goods_id, sku_id);
			} else {
				// 删除数据
				settings.remove(goods_id, sku_id);
			}

			if ($.isFunction(settings.click)) {

				var result = settings.click.call(settings, selected, sku);

				if (result != undefined && result == false) {
					// 删除数据
					settings.remove(goods_id, sku_id);
				}
			}

		});

		// 刷新数据
		settings.refreshSelectedData();

		return settings;
	};

	/**
	 * 数量步进器
	 * 
	 * @author niqingyang <niqy@qq.com>
	 */
	$.fn.amount = function(options) {

		var objects = [];

		$(this).each(function() {

			var defaults = {
				target: null,
				value: 1,
				min: 1,
				step: 1,
				max: null,
				// 支持：integer-整数（默认）,number-数字
				// type: 'integer',
				// value改变事件
				// @param element 元素
				change: null,
				// 解析
				parseValue: function(value) {
					return parseInt(value);
				}
			};

			var target = $(this);

			var settings = $.extend(true, {}, defaults, options);

			settings.target = target;

			if (!isNaN($(target).data("amount-min"))) {
				settings.min = $(target).data("amount-min");
			}
			if (!isNaN($(target).data("amount-max"))) {
				settings.max = $(target).data("amount-max");
			}

			if (!isNaN(settings.max) && settings.value > settings.max) {
				settings.value = settings.max;
				target.val(settings.value).change();
			} else if (!isNaN(settings.min) && settings.value < settings.min) {
				settings.value = settings.min;
				target.val(settings.value).change();
			}

			// 加
			$(target).parents(".amount").find(".amount-plus").click(function() {

				if (!isNaN($(target).data("amount-min"))) {
					settings.min = $(target).data("amount-min");
				}
				if (!isNaN($(target).data("amount-max"))) {
					settings.max = $(target).data("amount-max");
				}

				var value = parseInt(target.val()) + settings.step;

				if (isNaN(value)) {
					return;
				}

				if (isNaN(settings.parseValue(settings.max)) || value <= settings.max) {
					var result = true;
					if ($.isFunction(settings.change)) {
						result = settings.change.call(settings, target, value);
					}

					if (result == true || result == undefined) {
						target.val(value);
						settings.value = value;
						target.change();
					}
				}

			});

			// 减
			$(target).parents(".amount").find(".amount-minus").click(function() {

				if (!isNaN($(target).data("amount-min"))) {
					settings.min = $(target).data("amount-min");
				}
				if (!isNaN($(target).data("amount-max"))) {
					settings.max = $(target).data("amount-max");
				}

				var value = settings.parseValue(target.val()) - settings.step;
				if (isNaN(value)) {
					return;
				}
				if (isNaN(settings.parseValue(settings.min)) || value >= settings.min) {
					var result = true;

					if ($.isFunction(settings.change)) {
						result = settings.change.call(settings, target, value);
					}

					if (result == true || result == undefined) {
						target.val(value);
						settings.value = value;
						target.change();
					}
				}
			});

			// 键盘事件
			$(target).keyup(function(event) {

				if (!isNaN($(target).data("amount-min"))) {
					settings.min = $(target).data("amount-min");
				}
				if (!isNaN($(target).data("amount-max"))) {
					settings.max = $(target).data("amount-max");
				}

				if ($.trim(target.val()) == '') {
					target.val('');
					return;
				}

				var value = settings.value;

				// 190 - 小数点
				// 46 - delete
				// 8 - backspace
				// 37、39 - 左右光标
				var usable = true;
				if (event.keyCode != 46 && event.keyCode != 8 && event.keyCode != 37 && event.keyCode != 39) {
					if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))) {
						usable = false;
					}
				}

				if (usable) {
					value = settings.parseValue(target.val());
				}

				if (isNaN(value)) {
					value = settings.value;
				} else {
					if (!isNaN(settings.parseValue(settings.max)) && value >= settings.max) {
						value = settings.max;
					}

					if (!isNaN(settings.parseValue(settings.min)) && value <= settings.min) {
						value = settings.min;
					}
				}

				var result = true;
				if ($.isFunction(settings.change)) {
					result = settings.change.call(settings, $(this), value);
				}

				if (result == true || result == undefined) {
					target.val(value);
					settings.value = value;
					target.change();
				}

			}).focus(function() {
				// 禁用输入法
				this.style.imeMode = 'disabled';
			}).blur(function() {

				if (!isNaN($(target).data("amount-min"))) {
					settings.min = $(target).data("amount-min");
				}
				if (!isNaN($(target).data("amount-max"))) {
					settings.max = $(target).data("amount-max");
				}

				if ($.trim(target.val()) == '') {
					target.val(settings.min);
					settings.value = settings.min;
				}
			});

			objects.push(settings);
		});

		if ($(this).size() == 1) {
			return options;
		}

		return objects;
	}

	/**
	 * 图片组上传控件
	 */
	$.fn.imagegroup = function(settings) {

		var defaults = {
			host: null,
			url: '/site/upload-image',
			values: [],
			labels: [],
			// 验证器
			options: null,
			// 图片数量
			size: 1,
			// 显示模式
			mode: 0,
			// 图片库展示的容器
			container: null,
			// Ajax提交参数
			data: {},
			// 上传
			callback: null,
			// 移除的回调函数
			// @param value 移除的值
			// @param values 移除后的值
			remove: null,
			getValues: function() {
				var values = [];

				if (this.mode == 0) {
					$(container).find("li").find("img").each(function() {
						values.push($(this).data("value"));
					});
				} else {
					$(container).find("li:visible").each(function() {
						if ($(this).find("img").size() > 0) {
							values.push($(this).find("img").data("value"));
						} else {
							values.push("");
						}
					});
				}

				this.values = values;

				return this.values;
			},
			render: function() {
				var html = "<ul class='image-group'>";

				if (!$.isArray(this.values)) {
					this.values = [];
				}

				var count = 0;

				for (var i = 0; i < this.values.length; i++) {

					var value = this.values[i];

					if (value == undefined || value == null || $.trim(value) == '' || $.trim(value) == settings.host || $.trim(value) == settings.host + "/") {
						continue;
					}

					var src = value;

					if (src.indexOf("http://") == 0 || src.indexOf("https://") == 0) {
						src = value;
					} else {
						src = settings.host + "/" + value;

						while (src.indexOf("//") != -1) {
							src = src.replace("//", "/");
						}

						src = src.replace("http:/", "http://");
						src = src.replace("https:/", "https://");
					}

					html += "<li>";
					html += "<span title='删除' class='image-group-remove'>删除图片</span>";
					html += "<a href='javascript:void(0);' data-value='" + value + "'>";
					html += "<img src='" + src + "' data-value='" + value + "'>";
					html += "</a>";
					html += "</li>";

					count++;

					if (count >= this.size) {
						break;
					}
				}

				html += "<li class='image-group-button'>";
				html += "<div class='image-group-bg'></div>";
				var uuid = $.uuid();
				html += "<input type='file' id='imagegroup_file_" + uuid + "' name='imagegroup_file_" + uuid + "' class='inputstyle'>";
				html += "</li>";

				html += "</ul>";

				var element = $($.parseHTML(html));

				$(this.container).html(element);

				if (count >= this.size) {
					$(this.container).find(".image-group-button").hide();
				}
			},
			renderList: function() {
				var html = "<ul class='image-group'>";

				if (!$.isArray(this.values)) {
					this.values = [];
				}

				for (var i = 0; i < this.size; i++) {

					var value = this.values[i];

					if (value == undefined || value == null || $.trim(value) == '' || $.trim(value) == settings.host || $.trim(value) == settings.host + "/") {
						value = "";
					}

					var src = value;

					if (src.indexOf("http://") == 0 ||　src.indexOf("https://") == 0) {
						src = value;
					} else {
						src = settings.host + "/" + value;

						while (src.indexOf("//") != -1) {
							src = src.replace("//", "/");
						}

						src = src.replace("http:/", "http://");
						src = src.replace("https:/", "https://");
					}

					if (value != "") {

						if (this.labels[i]) {
							html += "<li class='m-b-20'>";
						} else {
							html += "<li>";
						}

						html += "<span title='删除' class='image-group-remove'>删除图片</span>";
						html += "<a href='javascript:void(0);' data-value='" + value + "'>";
						html += "<img src='" + src + "' data-value='" + value + "'>";
						html += "</a>";

						if (this.labels[i]) {
							html += "<span class='image-group-label'>" + this.labels[i] + "</span>";
						}

						html += "</li>";

						if (this.labels[i]) {
							html += "<li class='image-group-button m-b-20' data-label-index='" + i + "' style='display: none;'>";
						} else {
							html += "<li class='image-group-button' style='display: none;'>";
						}

						html += "<div class='image-group-bg'></div>";
						var uuid = $.uuid();
						html += "<input type='file' id='imagegroup_file_" + uuid + "' name='imagegroup_file_" + uuid + "' class='inputstyle'>";

						if (this.labels[i]) {
							html += "<span class='image-group-label'>" + this.labels[i] + "</span>";
						}

						html += "</li>";

					} else {

						if (this.labels[i]) {
							html += "<li class='image-group-button m-b-20' data-label-index='" + i + "'>";
						} else {
							html += "<li class='image-group-button'>";
						}

						html += "<div class='image-group-bg'></div>";
						var uuid = $.uuid();
						html += "<input type='file' id='imagegroup_file_" + uuid + "' name='imagegroup_file_" + uuid + "' class='inputstyle'>";

						if (this.labels[i]) {
							html += "<span class='image-group-label'>" + this.labels[i] + "</span>";
						}

						html += "</li>";

					}
				}

				html += "</ul>";

				var element = $($.parseHTML(html));

				$(this.container).html(element);
			}
		}

		settings.container = $(this).first();
		settings = $.extend(true, defaults, settings);

		if (!$.isArray(this.labels)) {
			this.labels = [];
		}

		if (this.labels.length > 0) {
			this.mode = 1;
		}

		var container = $(settings.container);

		if (settings.mode == 1) {
			// 模式二：直接显示图片列表
			settings.renderList();
		} else {
			// 模式一：默认
			settings.mode = 0;
			settings.render();
		}

		$(container).find(".image-group-button").find(":file").change(function() {

			if ($(container).find("li").not(".image-group-button").size() >= settings.size) {
				$.msg('最多上传' + settings.size + '张图片');
				return;
			}

			if ($(this).val() == '') {
				return false;
			}

			var target = $(this).parents(".image-group-button");
			var i = $(target).data("label-index");

			var options = null;

			if ($.isArray(settings.options) && settings.options[i]) {
				options = settings.options[i];
			} else if ($.isPlainObject(settings.options)) {
				options = settings.options;
			}

			$.imageupload({
				url: settings.url,
				options: options,
				data: settings.data,
				file: this,
				callback: function(result) {

					if (result.code == 0) {

						var url = settings.host + "/" + result.data.path;

						if (result.data.url) {
							url = result.data.url;
						}

						var html = "";

						if (settings.labels[i]) {
							html += "<li class='m-b-20'>";
						} else {
							html += "<li>";
						}

						html += "<span title='删除' class='image-group-remove'>删除图片</span>";
						html += "<a href='javascript:void(0);' data-value='" + result.data.path + "' data-url='" + url + "'>";
						html += "<img src='" + url + "' data-value='" + result.data.path + "'>";
						html += "</a>";

						if (settings.labels[i]) {
							html += "<span class='image-group-label'>" + settings.labels[i] + "</span>";
						}

						html += "</li>";

						var element = $($.parseHTML(html));
						$(target).before(element);

						settings.values = settings.getValues();

						if (settings.mode == 1 || $(container).find("li").not(".image-group-button").size() >= settings.size) {
							$(target).hide();
						}

						if ($.isFunction(settings.callback)) {
							settings.callback.call(settings, result.data);
						}

					} else {
						$.msg(result.message, {
							time: 5000
						});
					}
				}
			});

		});

		// 移除
		$(container).on("click", ".image-group-remove", function() {
			var value = $(this).parents("li:first").find("img").data("value");
			$(this).parents("li").next(".image-group-button").first().show();
			$(this).parents("li:first").remove();

			settings.values = settings.getValues();

			if ($.isFunction(settings.remove)) {
				settings.remove.call(settings, value, settings.values);
			}
		});

		$(container).on("click", "a", function() {

			var url = $(this).find("img").attr("src");

			if ($.isFunction($.open)) {

				var max_width = $(window).width() - 50;
				var max_height = $(window).height() - 50;

				var content_html = "<p style='background: #FFF; padding: 3px; border: solid 1px #DDD;'><img id='imgpreview_handle' src='" + url + "' style='max-width: " + max_width + "px;max-height: " + max_height + "px;'/></p>";

				top.$.open({
					type: 1,
					title: false,
					move: "#imgpreview_handle",
					scrollbar: true,
					closeBtn: 1,
					area: [max_width, max_height],
					skin: 'layui-layer-nobg', // 没有背景色
					shadeClose: true,
					content: content_html
				});
			} else {
				window.open(url);
			}

			return false;
		})

		return settings;
	};

	$.fn.goodsgallery = function(settings) {
		var defaults = {
			container: $(this),
			host: '',
			// 当前图片： 0-缩略图 1-大图 2-原图
			current: [],
			// 图片列表，每个图片都包含三张图片： 0-缩略图 1-大图 2-原图
			images: [],
			init: function() {

				$(this.container).addClass("goodsgallery");

				// 获取当前第一个
				this.current = this.images[0];

				if (!this.current) {
					this.current = [];
				}

				var html = '<div class="gg-current-img">';
				html += '<a href="' + this.current[2] + '" class="MagicZoom" id="gg-zoom" rel="zoom-position: right;">';
				html += '<img src="' + this.current[1] + '" class="gg-image" width="400" height="400" />';
				html += '</div>';
				html += '<div class="gg-imagebar clearfix">';

				// 相册向右滑动
				html += '<a href="javascript:;" class="gg-left-btn disabled"></a>';

				html += '<div class="gg-container">';
				html += '<div class="gg-content">';
				html += '<ul class="gg-handler">';

				html += this.render(this.images);

				html += '</ul>';
				html += '</div>';
				html += '</div>';

				// 相册向友滑动
				html += '<a href="javascript:;" class="gg-right-btn"></a>';

				$(this.container).html($.parseHTML(html));

				// 初始化按钮
				this.initButton();

				this.init = true;

			},
			render: function(images) {
				var html = "";
				for (var i = 0; i < images.length; i++) {
					var image = images[i];
					var current_class = i == 0 ? 'current' : '';
					html += '<li>';
					html += '<a href="' + image[2] + '" data-original="' + image[2] + '" rev="' + image[1] + '" rel="zoom-id: gg-zoom;" title="" class="' + current_class + '">';
					html += '<img src="' + image[1] + '" alt="" class="" />';
					html += '</a>';
					html += '</li>';
				}
				return html;
			},
			// 加载
			load: function(images) {
				var settings = this;
				var container = settings.container;

				var html = this.render(this.images);
				$(container).find(".gg-handler").html($.parseHTML(html));

				// 初始化按钮
				this.initButton();

				// 切换第一个图片显示
				$(container).find(".gg-handler li:first").mouseover();
			},
			// 初始化按钮栏
			initButton: function() {

				var settings = this;

				var container = settings.container;

				var index = 0;

				var leftBtn = $(container).find(".gg-left-btn");
				var rightBtn = $(container).find(".gg-right-btn");

				$(container).find(".gg-handler").width(70 * this.images.length);
				$(container).find(".gg-handler li").mouseover(function() {
					$(this).find('a').addClass('current');
					$(this).siblings().find('a').removeClass('current');

					var original = $(this).find("a").data("original");

					// 变更预览大图
					$(container).find(".MagicZoom").attr("href", original);
					$(container).find(".gg-image").attr("src", $(this).find("a").attr("rev"));
					$(container).find(".MagicZoomBigImageCont").find("img").attr("src", original);

				})

				if (this.images.length < 6) {
					$(rightBtn).addClass('disabled')
				}

				$(leftBtn).click(function() {
					index++;
					$(this).removeClass('disabled');
					if (num01 == (settings.images - 5)) {
						$(rightBtn).addClass('disabled');
					}
					if (num01 > (settings.images - 5)) {
						index = settings.images - 5;
					}
					if (gg_lis < 6) {
						index = 0;
						$(rightBtn).addClass('disabled');
						$(leftBtn).addClass('disabled');
					}
					$(container).find(".gg-handler").animate({
						left: -index * 70
					}, 100);
				});

				$(container).find(".gg-right-btn").click(function() {
					index--;
					if (index == 0) {
						$(rightBtn).removeClass('disabled');
						$(leftBtn).addClass('disabled');
					}
					if (index < 0) {
						index = 0;
					}
					$(container).find(".gg-handler").animate({
						left: -index * 70
					}, 100);
				});
			}

		};

		if ($(this).data("szy-goodsgallery")) {
			defaults = $(this).data("szy-goodsgallery");
			settings = $.extend(true, defaults, settings);
			settings.load(settings.images);
		} else {
			settings = $.extend(true, defaults, settings);
			settings.init();
		}

		$(this).data("szy-goodsgallery", settings);

		return settings;
	}

	function goods_gallery_control() {
		var num01 = 0;
		var gg_lis = $('#goods-gallery li').length;
		$('#goods-gallery').width(70 * gg_lis);
		$('#goods-gallery li').mouseover(function() {
			$(this).find('a').addClass('current');
			$(this).siblings().find('a').removeClass('current');
		})
		if (gg_lis < 6) {
			$('.scrright').addClass('disabled')
		}
		$('.scrright').click(function() {
			num01++;
			$('.scrleft').removeClass('disabled');
			if (num01 == (gg_lis - 5)) {
				$('.scrright').addClass('disabled');
			}
			if (num01 > (gg_lis - 5)) {
				num01 = gg_lis - 5;
			}
			if (gg_lis < 6) {
				num01 = 0;
				$('.scrright').addClass('disabled');
				$('.scrleft').addClass('disabled');
			}
			$('#goods-gallery').animate({
				left: -num01 * 70
			}, 100);
		})
		$('.scrleft').click(function() {
			num01--;
			if (num01 == 0) {
				$('.scrright').removeClass('disabled');
				$('.scrleft').addClass('disabled');
			}
			if (num01 < 0) {
				num01 = 0;
			}
			$('#goods-gallery').animate({
				left: -num01 * 70
			}, 100);
		})
	}

	$.fn.catselector = function(settings) {

		if (!settings) {
			return $(this).data("catselector");
		}

		var container = $(this);

		var defaults = {
			api: "catselector",
			container: $(this),
			url: '/site/cat-list.html',
			data: {
				format: "ztree"
			},
			values: [],
			items: null,
			ztree: null,
			// ztree配置
			ztree_config: {
				view: {
					dblClickExpand: true,
					selectedMulti: false,
					nameIsHTML: true
				},
				data: {
					simpleData: {
						enable: true,
						idKey: "cat_id",
						pIdKey: "parent_id",
						rootPId: "0",
					}
				}
			},
		};

		settings = $.extend(true, defaults, settings);

		settings = $(this).treechosen(settings);

		return settings;

	};

	$.fn.treechosen = function(settings) {

		var container = this;
		var ztree_id = uuid();

		var nodeMap = new Array();
		var hashSet = new Array();

		var zkeys = {
			root: null,
			id: null,
			parent_id: null,
			name: null,
		};

		function getRelationNodes(nodes, id) {
			var node = nodeMap[id];

			if (node != null && node[zkeys.parent_id] != zkeys.root && hashSet[node[zkeys.parent_id]] == undefined) {
				var pnode = nodeMap[node[zkeys.parent_id]];
				nodes.push(pnode);
				hashSet[pnode[zkeys.id]] = 0;
				return getRelationNodes(nodes, node[zkeys.parent_id]);
			}
		}

		function getFont(treeId, node) {
			return node.font ? node.font : {};
		}

		var defaults = {
			api: "treechosen",
			container: $(this),
			url: null,
			data: {
				format: "ztree"
			},
			values: [],
			items: null,
			getValues: function() {
				var values = [];
				$(this.container).find(".tree-chosen-item").each(function() {
					values.push($(this).data("value"));
				});
				return values;
			},
			getCheckedNodes: function(checked) {
				if (this.ztree) {
					checked = checked == false ? false : true;
					return this.ztree.getCheckedNodes(checked);
				} else {
					return [];
				}
			},
			addCallback: function(id, name) {

			},
			removeCallback: function(id, name) {

			},
			change: function() {

			},
			ztree: null,
			// ztree配置
			ztree_config: {
				check: {
					enable: false,
					chkStyle: 'checkbox',
				},
				view: {
					fontCss: getFont,
					dblClickExpand: true,
					selectedMulti: true,
					nameIsHTML: true
				},
				data: {
					key: {
						name: "name"
					},
					simpleData: {
						enable: true,
						idKey: "id",
						pIdKey: "parent_id",
						rootPId: "0",
					}
				},
				callback: {
					onClick: function(event, treeId, treeNode) {

					}
				}
			},
			render: function() {
				var html = '<div class="form-control-box">';
				html += '<div class="tree-chosen-box">';
				html += '<div class="tree-chosen-input-box form-control">';

				for ( var i in this.values) {
					var name = this.values[i];
					html += '<span class="tree-chosen-item" data-value="' + i + '" data-name="' + name + '">' + name + '<i class="tree-chosen-close" title="点击移除">×</i></span>';
				}
				html += '</div>';

				html += '<div class="tree-chosen-panel-box">';
				html += '<input type="text" class="tree-chosen-input form-control-xs m-r-5" value="" placeholder="输入关键词、简拼、全拼搜索" style="width: 200px;">';
				html += '<a class="btn btn-primary btn-sm tree-chosen-btn-open m-r-2" title="全部展开/收起"><i class="fa fa-plus-circle" style="margin-right: 0px;"></i></a>';
				html += '<a class="btn btn-primary btn-sm tree-chosen-btn-clear" title="全部清除所选"><i class="fa fa-trash-o" style="margin-right: 0px;"></i></a>';
				html += '<div class="ztree-box">';
				html += '<ul id="' + ztree_id + '" class="ztree"></ul>';
				html += '</div>';
				html += '</div>';
				html += '</div>';

				$(this.container).html(html);
			},
			// 添加
			add: function(id, name) {
				if ($(this.container).find(".tree-chosen-input-box").find(".tree-chosen-item[data-value='" + id + "']").size() == 0) {
					var html = '<span class="tree-chosen-item" data-value="' + id + '" data-name="' + name + '">' + name + '<i class="tree-chosen-close" title="点击移除">×</i></span>';
					var last_item = $(this.container).find(".tree-chosen-input-box").find(".tree-chosen-item").last();
					if (last_item.size() > 0) {
						$(last_item).after(html);
					} else {
						$(this.container).find(".tree-chosen-input-box").prepend(html);
					}

					if ($.isFunction(this.addCallback)) {
						this.addCallback.call(this, id, name);
					}

					if ($.isFunction(this.change)) {
						this.change.call(this);
					}
				}
			},
			// 移除
			remove: function(id) {

				var target = $(this.container).find(".tree-chosen-input-box").find(".tree-chosen-item[data-value='" + id + "']");

				$(target).remove();

				if ($.isFunction(this.addCallback)) {
					this.addCallback.call(this, id, $(target).data("name"));
				}

				if ($.isFunction(this.change)) {
					this.change.call(this);
				}
			},
			// 隐藏
			hide: function() {
				$(container).find(".tree-chosen-panel-box").hide();
			},
			// 显示
			show: function() {

				if (settings.items == null) {
					$.loading.start();

					$.get(this.url, this.data, function(result) {
						if ($.fn.zTree) {

							$.fn.zTree.init($(container).find("#" + ztree_id), settings.ztree_config, result.data);

							settings.ztree = $.fn.zTree.getZTreeObj(ztree_id);

							settings.items = result.data;

							var nodes = settings.ztree.getNodes();

							for (var i = 0; i < nodes.length; i++) {
								var node = nodes[i];
								if (node != null) {
									nodeMap[node[zkeys.id]] = node;
								}

								if (node.children && node.children.length > 0) {
									node.isParent = true;
								} else {
									node.isParent = false;
								}

								settings.ztree.updateNode(node);
							}

							$(container).find(".tree-chosen-panel-box").show();
						} else {
							alert("缺少zTree");
						}
					}, "JSON").always(function(result) {
						$.loading.stop();
					});
				} else {
					$(container).find(".tree-chosen-panel-box").show();
				}
			},
			// 搜索
			search: function(keyword) {

				var zNodes = this.items;

				for (var i = 0; i < zNodes.length; i++) {
					zNodes[i].font = {};
				}

				if (keyword == null || keyword.length == 0) {
					$.fn.zTree.init($("#" + ztree_id), this.ztree_config, zNodes);
					this.ztree = $.fn.zTree.getZTreeObj(ztree_id);
					this.ztree.refresh();
					return;
				}

				hashSet = new Array();

				var nodes = new Array();

				for (var i = 0; i < zNodes.length; i++) {
					var node = zNodes[i];

					if (node.children && node.children.length > 0) {
						node.isParent = true;
					} else {
						node.isParent = false;
					}

					if (node != null && node.keywords != undefined && node.keywords.indexOf(keyword) != -1 && hashSet[node[zkeys.parent_id]] == undefined) {
						node.font = {
							'color': 'red'
						};
						nodes.push(node);
						hashSet[node[zkeys.id]] = 0;

						getRelationNodes(nodes, node[zkeys.id]);
					}
				}

				$.fn.zTree.init($("#" + ztree_id), this.ztree_config, nodes);
				this.ztree = $.fn.zTree.getZTreeObj(ztree_id);
				this.ztree.refresh();
				this.ztree.expandAll(true);
			}
		};

		settings = $.extend(true, defaults, settings);
		settings.container = container;

		// 渲染页面
		settings.render();

		// 获取数据与ztree的key对应关系
		zkeys.id = settings.ztree_config.data.simpleData.idKey;
		zkeys.parent_id = settings.ztree_config.data.simpleData.pIdKey;
		zkeys.name = settings.ztree_config.data.key.name;
		zkeys.root = settings.ztree_config.data.simpleData.rootPId;

		// 单击回调函数
		settings.ztree_config.callback.onClick = function(event, treeId, treeNode) {
			settings.add(treeNode[zkeys.id], treeNode[zkeys.name]);
		}

		$(this).find(".tree-chosen-input").keyup(function() {
			settings.search($(this).val());
		});

		$(container).find(".tree-chosen-box").click(function(event) {
			if ($(event.target).hasClass("tree-chosen-close")) {
				var target = $(event.target).parents(".tree-chosen-item");
				settings.remove($(target).data("value"));
			}
			settings.show();
			return false;
		});

		$(container).find(".tree-chosen-panel-box").on("click", function() {
			return false;
		});

		$(container).find(".tree-chosen-btn-open").on("click", function() {
			var expandFlag = true;
			if ($(this).data("is-open") == true) {
				expandFlag = false;
			}
			settings.ztree.expandAll(expandFlag);
			return false;
		});

		$(container).find(".tree-chosen-btn-clear").on("click", function() {
			$(container).find(".tree-chosen-item").remove();
			return false;
		});

		$("body").on("click", function(event) {
			$(container).find(".tree-chosen-panel-box").hide();
		});

		$(this).data(settings.api, settings);

		return settings;
	}

})(jQuery);