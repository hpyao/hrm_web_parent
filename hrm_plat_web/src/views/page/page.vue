<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :model="filters" :inline="true">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getPagers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="add">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表v-loading="listLoading"
    private Long pid;

		-->
		<el-table :data="pagers" v-loading="listLoading" highlight-current-row  style="width: 100%;">
			<!--多选框-->
			<el-table-column type="selection" width="55">
			</el-table-column>
			<!--索引值,为什么不用id,id不序号-->
			<el-table-column type="index" width="60">
			</el-table-column>

			<!--其他都设置值,只有一个不设置值就自动适应了-->
			<el-table-column prop="name" label="名称">
			</el-table-column>
			<el-table-column prop="alias" label="别名">
			</el-table-column>
			<el-table-column prop="type" label="类型">
			</el-table-column>
			<el-table-column prop="templateUrl" label="模板地址">
			</el-table-column>
			<el-table-column prop="physicalPath" label="物理路径">
			</el-table-column>
			<el-table-column prop="site.name" label="站点">
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间">
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small"  @click="edit(scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="del(scope.row)">删除</el-button>
				</template>
			</el-table-column>

		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"  :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--//多对一-->
		<!--private Employee manager;                               // 部门经理 员工对象-->
		<!--后台提供获取所有员工-->
		<!--//多对一-->
		<!--private Department parent;                              // 上级部门 部门对象-->

		<!--添加或编辑对话框-->
		<el-dialog title="添加或修改" :visible.sync="formVisible" :close-on-click-modal="false">
			<el-form :model="pager" label-width="80px" :rules="formRules" ref="pager">
				<el-form-item label="名称" prop="name">
					<el-input v-model="pager.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="别名" prop="alias">
					<el-input v-model="pager.alias" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-input v-model="pager.type" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item prop="templateUrl" label="模板">
					<el-input type="text" v-model="pager.templateUrl" auto-complete="off" placeholder="请输入模板！"></el-input>
					<el-upload
							class="upload-demo"
							action="http://localhost:9527/services/fastdfs/fastdfs/upload"
							:on-success="handleSuccess"
							:on-preview="handlePreview"
							:on-remove="handleRemove"
							:file-list="fileList"
							list-type="picture">
						<el-button size="small" type="primary">点击上传</el-button>
						<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>

				</el-form-item>
				<el-form-item label="物理路径" prop="physicalPath">
					<el-input v-model="pager.physicalPath" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="formVisible = false">取消</el-button>
				<el-button type="primary" @click="save" >提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	export default {
		data() {
			return {
                formVisible:false,//对话框默认不显示,只有点击添加或修改的时候显示
                listLoading:false,
				//查询对象
				filters:{
					keyword:''
				},
				page:1,//当前页,要传递到后台的
				total:0, //分页总数
			    pagers:[], //当前页数据
				//初始值
                pager:{
                    id:null,
					name:'',
					alias:'',
					type:'',
					templateUrl:'',
					physicalPath:'',
					site:null,
				},
				employees:[],
                formRules: {
                    name: [
                        { required: true, message: '请输入名称!', trigger: 'blur' }
                    ]
                }
			}
		},
		methods: {
            handleSuccess(response, file, fileList){
                console.log("===========")
                console.log(response);
                console.log(file);
                console.log(fileList);
                this.pager.templateUrl = response;
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
			add(){
				//清空数据
				this.pager={
                    id:null,
                    name:'',
                    alias:'',
                    type:'',
                    templateUrl:'',
                    physicalPath:'',
                    site:{},
				}
				//打开dialog
				this.formVisible =true;
				this.getEmployees();
			},
            stateFormatter(row, column, cellValue, index){

                if(cellValue===0){
                    return "正常";
				}else{
                    return "停用";
				}
			},
            handleCurrentChange(curentPage){
                this.page = curentPage;
                this.getPagers();
			},
		    save(){
                this.$refs.pager.validate((valid) => {
                    //校验表单成功后才做一下操作
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                            let para = Object.assign({}, this.pager);
                            //判断是否有id有就是修改,否则就是添加
							this.$http.post("/page/pager/save",para).then((res) => {
								this.$message({
									message: '操作成功!',
									type: 'success'
								});
								//重置表单
								this.$refs['pager'].resetFields();
								//关闭对话框
								this.formVisible = false;
								//刷新数据
								this.getPagers();
							});
                        });
                    }
                })
			},
            edit(row){
                //回显
                let pagerTmp = Object.assign({}, row); //解决对话框改值后列表会被改值.
                this.pager = pagerTmp; //里面本来就有id,相当于回显了id
				//显示
                this.formVisible =true;
			},
			  getEmployees(){
                //发送请求到后台获取数据
                  this.$http.patch("/employee") //$.Post(.....)
                      .then(result=>{
                          this.employees = result.data;
                      });
			  }
		    ,
            getPagers(){
                //发送Ajax请求后台获取数据  axios
				//添加分页条件及高级查询条件
				let para = {
				    "page":this.page,
					"keyword":this.filters.keyword
				};
				this.listLoading = true; //显示加载圈
				//分页查询
                this.$http.post("/page/pager/json",para) //$.Post(.....)
                    .then(result=>{
                        this.total = result.data.total;
                        this.pagers = result.data.rows;
                        this.listLoading = false;  //关闭加载圈
                    });
			},
			del(row){
                console.log(row);
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    var id = row.id;
                    this.listLoading = true;
                    this.$http.delete("/pager/"+id)
                        .then(result=>{
                            this.listLoading = false;
                            //做提示
                            if(result.data.success){
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
							}else{
                                this.$message({
                                    message: result.data.message,
                                    type: 'error'
                                });
							}
							//刷新数据
                            this.getPagers();
                        })
				});

			}
		},
		mounted() {
		    this.getPagers()
		}
	}

</script>

<style scoped>

</style>