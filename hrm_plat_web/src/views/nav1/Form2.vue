<template>
	<baidu-map :center="{lng: 116.403765, lat: 39.914850}" :zoom="11">
		<bm-view class="map"></bm-view>
		<bm-control :offset="{width: '10px', height: '10px'}">
			<bm-auto-complete v-model="keyword" :sugStyle="{zIndex: 1}">
				<div style="margin-bottom:10px">
					<input type="text" placeholder="请输入关键字" class="searchinput"/>
					<el-button type="success">确定</el-button>
				</div>
			</bm-auto-complete>
		</bm-control>
		<bm-local-search :keyword="keyword" :auto-viewport="true" ></bm-local-search>
	</baidu-map>

</template>

<script>
	export default {
		data() {
			return {
                keyword: ''
			}
		},
		methods: {
		}
	}

</script>
<style>
	.map {
		width: 100%;
		height: 300px;
		z-index: -10;
	}
	.tangram-suggestion{
		z-index: 5000;
	}
	.searchinput{
		width: 300px;
		box-sizing: border-box;
		padding: 9px;
		border: 1px solid #dddee1;
		line-height: 20px;
		font-size: 16px;
		height: 38px;
		color: #333;
		position: relative;
		border-radius: 4px;
	}
</style>