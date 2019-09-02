<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :model="filters" :inline="true">
				<el-form-item>
					<el-input v-model="filters.keywords" placeholder="关键字" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getRoles">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="add">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--private Employee manager;                               // 部门经理 员工对象-->
		<!--private Department parent;                              // 上级部门 部门对象-->
		<!--private Tenant tenant;                                  // 租户-->


		<!--列表v-loading="listLoading"-->
		<el-table :data="roles" v-loading="listLoading" highlight-current-row  style="width: 100%;">
			<!--多选框-->
			<el-table-column type="selection" width="55">
			</el-table-column>
			<!--索引值,为什么不用id,id不序号-->
			<el-table-column type="index" width="60">
			</el-table-column>
			<!--其他都设置值,只有一个不设置值就自动适应了-->
			<el-table-column prop="name" label="名称">
			</el-table-column>
			<el-table-column prop="sn" label="标识">
			</el-table-column>
			<el-table-column prop="permissions" label="拥有权限" :formatter="permissionsFormatter">
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
			<el-form :model="role" label-width="80px" :rules="formRules" ref="role">
				<el-form-item label="名称" prop="name">
					<el-input v-model="role.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标识" prop="sn">
					<el-input v-model="role.sn" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标识" prop="sn">
					<el-transfer v-model="selectedPermissons" :props="{key:'id',label:'name'}" :data="permissions"></el-transfer>
				</el-form-item>
				{{selectedPermissons}}
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
					keywords:''
				},
				page:1,//当前页,要传递到后台的
				total:0, //分页总数
			    roles:[], //当前页数据
				permissions:[],
                selectedPermissons:[],
				//初始值
                role:{
                    id:null,
					name:'',
					sn:'',
					dirPath:'',
					state:0,
                    manager:null,
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
			add(){
				//清空数据
				this.role={
					id:null,
					name:'',
					sn:'',
					dirPath:'',
					state:0,
					manager:null,
				}
				//打开dialog
				this.formVisible =true;
				this.getEmployees();
			},
            permissionsFormatter(row, column, cellValue, index){

               if(cellValue){ //权限
                   var show = "";
                   for(var item of cellValue){
                       show+=item.name+",";
				   }
				   return show;
			   }
			},
            handleCurrentChange(curentPage){
                this.page = curentPage;
                this.getRoles();
			},
		    save(){
                this.$refs.role.validate((valid) => {
                    //校验表单成功后才做一下操作
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                            let para = Object.assign({}, this.role);
                            //判断是否有id有就是修改,否则就是添加
							//selelectPermissions:[2,3];
							if(this.selectedPermissons){
							    var xxx = [];
							    for(var index in this.selectedPermissons){
							        //EasysUi
                                    //this.role.permissions[index].id = this.selectedPermissons[index];
									xxx.push({"id":this.selectedPermissons[index]})

								}
                                para.permissions = xxx;
							}
							console.log(para);

							this.$http.put("/department",para).then((res) => {
								this.$message({
									message: '操作成功!',
									type: 'success'
								});
								//重置表单
								this.$refs['role'].resetFields();
								//关闭对话框
								this.formVisible = false;
								//刷新数据
								this.getRoles();
							});
                        });
                    }
                })
			},
            edit(row){
                //this.getEmployees();
                //回显
                let roleTmp = Object.assign({}, row); //解决对话框改值后列表会被改值.
                this.role = roleTmp; //里面本来就有id,相当于回显了id

                if(row.permissions){
                    for(var p of row.permissions){
                        this.selectedPermissons.push(p.id)
                    }
				}

				this.$http.patch("/permission")
					.then(result=>{
                        this.permissions = result.data;
                    })
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
            getRoles(){
			    this.total = 100;
			    this.roles = [
                    {
                        id:1,
                        "name":"超级管理员",
                        permissions:[{id:2,name:"权限2"},{id:3,name:"权限3"}]}
                ]
			},
			del(row){
                console.log(row);
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    var id = row.id;
                    this.listLoading = true;
                    this.$http.delete("/role/"+id)
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
                            this.getRoles();
                        })
				});

			}
		},
		mounted() {
		    this.getRoles()
		}
	}

</script>

<style scoped>

</style>