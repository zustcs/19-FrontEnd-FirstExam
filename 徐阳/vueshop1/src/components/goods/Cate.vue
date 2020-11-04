<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
       <el-row>
           <el-col>
               <el-button type="primary" @click="showAddCateDialog">
                   添加分类
               </el-button>
           </el-col>
       </el-row>
       <!-- 表格 -->
       <tree-table :data="catelist" :columns="columns"
       :selection-type="false" :expand-type="false" show-index
       index-text="#" border :show-row-hover="false" class="treeTable">
       <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted===false" 
            style="color:lightgreen"></i>
            <i class="el-icon-error" v-else
            style="color:lightgreen"></i>
        </template>
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" 
            v-if="scope.row.cat_level===0">
                一级
            </el-tag>
            <el-tag type="success" size="mini"
            v-else-if="scope.row.cat_level===1">
                二级
            </el-tag>
            <el-tag type="warning" size="mini"
            v-else>
                三级
            </el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
            <el-button type="primary" size="mini" 
            @click="showEditDialog(scope.row.cat_id,scope.row.cat_name)">编辑</el-button>
            <el-button type="danger" size="mini" 
            @click="removeUserById(scope.row.id)">删除</el-button>
        </template>
       </tree-table>
       <!-- 分页区域 -->
        <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"
  >
  <!-- 添加分类的表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" 
  ref="addCateFormRef" label-width="100px">
  <el-form-item label="分类名称:" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类:" >
      <!-- props用来指定配置对象 -->
      <el-cascader expand-trigger="hover"
    v-model="selectedKeys"
    :options="parentCateList" :props="cascaderProps"
   
    @change="parentCateChanged"></el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCateDialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
 <!-- 修改用户的对话框 -->
    <el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed"
  >
 <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
 label-width="70px" class="demo-ruleForm" status-icon>
  <el-form-item label="用户名" prop="cat_name">
    <el-input v-model="editForm.cat_name" ></el-input>
  </el-form-item>
 </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            //查询条件
            querInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            //商品分类的数据列表,默认为空
            catelist:[

            ],
            //总数据条数
            total:0,
            //为table指定列的定义
            columns:[
                {label:'分类名称',
                 prop:'cat_name'
                },
                {
                 label:'是否有效',
                 type:'template',
                 //表示当前这一列使用的模版名称
                 template:'isok'
                },{
                    label:'排序',
                 type:'template',
                 //表示当前这一列使用的模版名称
                 template:'order' 
                },
                ,{
                    label:'操作',
                 type:'template',
                 //表示当前这一列使用的模版名称
                 template:'opt' 
                }
            ],
            addCateDialogVisible:false,
            addCateForm:{
                cat_name:'',
                cat_pid:0,
                cat_level:0
            },
            addCateFormRules:{
                cat_name:[{
                    required:true,message:'请输入分类名称',
                    trigger:'blur'
                }]
            },
            parentCateList:[],
            //指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children',

            },
            selectedKeys:[],
            editDialogVisible:false,
              editForm:{

        },
         editFormRules:{
         roleName:[
          {
            require:true,message:'请输入用户名',
            trigger:'blur'
          },
         
        ]
      },
      cat_name:''
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取商品分类数据
        async getCateList(){
        //   const {data:res}=await this.$http.get('categories',{...this.querInfo })
          const {data:res}=await this.$http.get('categories',{params:this.querInfo })
          
          if(res.meta.status!==200){
              return this.$message.error('获取商品分类失败')
          }
          //把数据列表赋值给catelist
          console.log(res.data);
          this.catelist = res.data.result
          //为总数据条数赋值
          this.total = res.data.total;
    
        },
        handleSizeChange(newSize){
        this.querInfo.pagesize = newSize
        this.getCateList()
    },
    handleCurrentChange(newPage){
        this.querInfo.pagenum = newPage
        this.getCateList()
    },
    //点击按钮展示添加分类的对话框
    showAddCateDialog(){
        this.getParentCateList();
        this.addCateDialogVisible = true
    },
  async  getParentCateList(){
     const{data:res} = await this.$http.get('categories',{params:{
            type:2,

        }})
        if(res.meta.status!==200){
            return this.$message.error('获取父级分类数据失败')
        }
        console.log(res.data);
        this.parentCateList = res.data
    },
    parentCateChanged(){
        console.log(this.selectedKeys);
    },
     async removeUserById(id){
      console.log(id);
      //弹框询问用户是否删除数据
       const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err
        })
        console.log(confirmResult);
        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除')
        }
        // console.log('确认了删除');
        const{data:res}=await this.$http.delete('categories/'+ id)
        if(res.meta.status !== 200){
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getCateList()
    },
   async showEditDialog(id){

const{data:res}= await this.$http.get(`categories/${id}`)
console.log('res', res)
      this.editDialogVisible = true
       if (res.meta.status !== 200) {
          this.$message.error("添加用户信息失败");
        console.log('res', res)
        }
        this.editForm=res.data
         this.editDialogVisible = true
    },
      //监听修改用户对话框的关闭事件
      editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        console.log(valid);
        if(!valid) return
        //发起修改用户信息的数据请求
        console.log('editForm', this.editForm)
       const {data:res} = await this.$http.put('categories/'+this.editForm.cat_id,{
         cat_name:this.editForm.cat_name
        })
        console.log('res', res)
        if(res.meta.status !==200 ){
          return this.$message.err('更新用户信息失败')

        }
        //关闭对话框
        this.editDialogVisible = false
        //刷新数据列表
        this.getCateList()
        
        //提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    },
    
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
</style>