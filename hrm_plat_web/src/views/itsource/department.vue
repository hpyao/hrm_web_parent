<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :model="filters" :inline="true">
				<el-form-item>
					<el-input v-model="filters.keywords" placeholder="关键字" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getDepartments">查询</el-button>
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
		<el-table :data="departments" v-loading="listLoading" highlight-current-row  style="width: 100%;">
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
			<el-table-column prop="dirPath" label="路径">
			</el-table-column>
			<el-table-column prop="state" label="状态">
				<template slot-scope="scope">
					<span v-if="scope.row.state!=null && scope.row.state==-1" style="color: red">停用</span>
					<span v-else>正常</span>
				</template>
			</el-table-column>
			<el-table-column prop="manager.username" label="部门经理">
				<template slot-scope="scope">

					<div v-if="scope.row.manager!=null" v-html="scope.row.manager.username"></div>
				</template>
			</el-table-column>
			<el-table-column prop="parent.name" label="上级部门">
			</el-table-column>
			<el-table-column prop="tenant.companyName" label="租户">
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
			<el-form :model="department" label-width="80px" :rules="formRules" ref="department">
				<el-form-item label="名称" prop="name">
					<el-input v-model="department.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标识" prop="sn">
					<el-input v-model="department.sn" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="路径" prop="dirPath">
					<el-input v-model="department.dirPath" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="状态" prop="state">
					<el-radio-group v-model="department.state" >
						<el-radio checked="checked" :label="0">正常</el-radio>
						<el-radio  :label="-1">停用</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="部门经理" prop="manager">
					<el-select v-model="department.manager" placeholder="请选择">
						<el-option
								v-for="item in employees"
								:key="item.id"
								:label="item.username"
								:value="item.id">
							<span style="float: left">{{ item.id }}</span>
							<span style="float: right; color: #8492a6; font-size: 13px">{{ item.username }}</span>
						</el-option>
					</el-select>
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
					keywords:''
				},
				page:1,//当前页,要传递到后台的
				total:0, //分页总数
			    departments:[], //当前页数据
				//初始值
                department:{
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
				this.department={
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
            stateFormatter(row, column, cellValue, index){

                if(cellValue===0){
                    return "正常";
				}else{
                    return "停用";
				}
			},
            handleCurrentChange(curentPage){
                this.page = curentPage;
                this.getDepartments();
			},
		    save(){
                this.$refs.department.validate((valid) => {
                    //校验表单成功后才做一下操作
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                            let para = Object.assign({}, this.department);
                            //判断是否有id有就是修改,否则就是添加
							this.$http.put("/department",para).then((res) => {
								this.$message({
									message: '操作成功!',
									type: 'success'
								});
								//重置表单
								this.$refs['department'].resetFields();
								//关闭对话框
								this.formVisible = false;
								//刷新数据
								this.getDepartments();
							});
                        });
                    }
                })
			},
            edit(row){
                //this.getEmployees();
                //回显
                let departmentTmp = Object.assign({}, row); //解决对话框改值后列表会被改值.
                this.department = departmentTmp; //里面本来就有id,相当于回显了id
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
            getDepartments(){
                //发送Ajax请求后台获取数据  axios
				//添加分页条件及高级查询条件
				let para = {
				    "page":this.page,
					"keywords":this.filters.keywords
				};
				this.listLoading = true; //显示加载圈
				//分页查询
                this.$http.post("/department",para) //$.Post(.....)
                    .then(result=>{
                        console.log(result);
                        console.log(result.data); //data就是 PageListjson转换结果
                        this.total = result.data.total;
                        this.departments = result.data.rows;
                        this.listLoading = false;  //关闭加载圈
                    });
				/* 查询所有
				this.$http.patch("/department",para) //$.Post(.....)
					.then(result=>{
                        console.log(result);
                        console.log(result.data);
                        this.departments = result.data;
                        this.listLoading = false;  //关闭加载圈
                    });
                    */
			},
			del(row){
                console.log(row);
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    var id = row.id;
                    this.listLoading = true;
                    this.$http.delete("/department/"+id)
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
                            this.getDepartments();
                        })
				});

			}
		},
		mounted() {
		    this.getDepartments()
		}
	}

</script>

<style scoped>

</style>