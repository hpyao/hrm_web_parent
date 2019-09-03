<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :model="filters" :inline="true">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getCourses">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="add">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="add">课程营销</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="add">课程图片</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary">课程阶段</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary">上线</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary">下线</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表v-loading="listLoading"
    private Long pid;

		-->
		<el-table :data="courses" v-loading="listLoading" highlight-current-row  style="width: 100%;">
			<!--多选框-->
			<el-table-column type="selection" width="55">
			</el-table-column>
			<!--索引值,为什么不用id,id不序号-->
			<el-table-column type="index" width="60">
			</el-table-column>
			<!--其他都设置值,只有一个不设置值就自动适应了-->
			<el-table-column prop="name" label="名称">
			</el-table-column>
			<el-table-column prop="courseTypeId.name" label="类型">
			</el-table-column>
			<el-table-column prop="tenantName" label="机构">
			</el-table-column>
			<el-table-column prop="userName" label="创建者">
			</el-table-column>
			<el-table-column prop="startTime" label="上线时间">
			</el-table-column>
			<el-table-column prop="endTime" label="下线时间">
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
			<el-form :model="course" label-width="80px" :rules="formRules" ref="course">
				<el-form-item label="名称" prop="name">
					<el-input v-model="course.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="适用人群" prop="users">
					<el-input v-model="course.users" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="课程等级" prop="grade">
					<el-radio-group v-model="course.grade" >
						<!--从数据字典查询
						<tr v-for="student in students">
							<td>{{student.id}}</td>
							<td>{{student.name}}</td>
							<td>{{student.age}}</td>
							<td>{{student.sex}}</td>
						</tr>
						-->
						<el-radio v-for="courseLevel in courseLevels"
								  :label="courseLevel.id">{{courseLevel.name}}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="课程类型" prop="courseTypeId">
					<el-input v-model="course.courseTypeId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="简介" prop="intro">
					<el-input v-model="course.detail.intro" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="详情" prop="description">
					<el-input v-model="course.detail.description" auto-complete="off"></el-input>
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
			    courses:[], //当前页数据
				courseLevels:[],
				//初始值
                course:{
                    id:null,
					name:'',
					users:'',
					courseTypeId:null,
					grade:null,
					detail:{
                        intro:'',
                        description:''
					}
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
		    getCourseLevels(){
                //发送请求到后台获取数据
                this.$http.get("/sysmanage/systemdictionaryitem/listSn?sn=courseLevel")
                    .then(result=>{
                        this.courseLevels = result.data;
                    });

			},
			add(){
				//清空数据
				this.course={
                    id:null,
                    name:'',
                    users:'',
                    courseTypeId:null,
                    grade:null,
                    detail:{
                        intro:'',
                        description:''
                    }
				}
				//打开dialog
				this.formVisible =true;
				this.getCourseLevels();
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
                this.getCourses();
			},
		    save(){
                this.$refs.course.validate((valid) => {
                    //校验表单成功后才做一下操作
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                            let para = Object.assign({}, this.course);
                            //判断是否有id有就是修改,否则就是添加
							this.$http.post("/course/course/save",para).then((res) => {
								this.$message({
									message: '操作成功!',
									type: 'success'
								});
								//重置表单
								this.$refs['course'].resetFields();
								//关闭对话框
								this.formVisible = false;
								//刷新数据
								this.getCourses();
							});
                        });
                    }
                })
			},
            edit(row){
                //回显
                let courseTmp = Object.assign({}, row); //解决对话框改值后列表会被改值.
                this.course = courseTmp; //里面本来就有id,相当于回显了id
				//显示
                this.formVisible =true;
                this.getCourseLevels();
			}
		    ,
            getCourses(){
                //发送Ajax请求后台获取数据  axios
				//添加分页条件及高级查询条件
				let para = {
				    "page":this.page,
					"keyword":this.filters.keyword
				};
				this.listLoading = true; //显示加载圈
				//分页查询
                this.$http.post("/course/course/json",para) //$.Post(.....)
                    .then(result=>{
                        this.total = result.data.total;
                        this.courses = result.data.rows;
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
                    this.$http.delete("/course/"+id)
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
                            this.getCourses();
                        })
				});

			}
		},
		mounted() {
		    this.getCourses()
		}
	}

</script>

<style scoped>

</style>