<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col
                :span="5"
                :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              >
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item3.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="['bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>
                     {{scope.row}}
                </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
             @click="showEditDialog(scope.row.id)" >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)">删除</el-button
            >
            <el-button size="mini" type="warning" icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)">分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog
  title="添加角色"
  :visible.sync="addDialogVisible"
  width="50%"
  >
  <!-- 内容主体区域 -->
 <el-form :model="addForm" :rules="addFormRules" 
 ref="addFormRef" label-width="70px" class="demo-ruleForm">
  <el-form-item label="用户名" prop="roleName">
    <el-input v-model="addForm.roleName"></el-input>
  </el-form-item>
 </el-form>
  <!-- 底部区域 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
</el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog
  title="修改角色"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed"
  >
 <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
 label-width="70px" class="demo-ruleForm" status-icon>
  <el-form-item label="用户名" prop="roleName">
    <el-input v-model="editForm.roleName" ></el-input>
  </el-form-item>

 </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%" @close="setRightDialogClosed"
  >
  <!-- 树形控件 -->
 <el-tree :data="rightslist" :props="treeProps" 
  show-checkbox node-key="id" 
 default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,
      rightslist:[],
      //树形控件的属性绑定对象
      treeProps:{
        label: 'authName',
        children:'children'
      },
      //默认选中的节点id值
      defKeys:[105,116],
      //当前即将分配角色的id
      roleId:'',
      //控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      //添加用户的表单数据
      addForm:{
        roleName:''
      },
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
      //控制修改用户对话框的显示与隐藏
      editDialogVisible:false,
      addFormRules:{
        roleName:[
          {
            require:true,message:'请输入用户名',
            trigger:'blur'
          },{min:3,max:10,message:'用户名的长度在3-10个之间',
          trigger:'blur'}
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolelist = res.data;
      console.log(this.rolelist);
    },
    //编辑角色
    async showEditDialog(id){
      console.log(id);
    const{data:res}= await this.$http.get('roles/'+id)
    console.log('获得用户数据res', res)
      this.editDialogVisible = true
       if (res.meta.status !== 200) {
          this.$message.error("添加用户信息失败");
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
       const {data:res} = await this.$http.put('roles/'+this.editForm.roleId,{
         roleName:this.editForm.roleName
        })
        console.log('res', res)
        if(res.meta.status !==200 ){
          return this.$message.err('更新用户信息失败')

        }
        //关闭对话框
        this.editDialogVisible = false
        //刷新数据列表
        this.getRolesList()
        //提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    //添加角色
     addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        //可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
        this.getRoleList();
      });
    },
    // 删除角色
    async removeRoleById(id){
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
        const{data:res}=await this.$http.delete('roles/'+ id)
        if(res.meta.status !== 200){
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getRolesList()
    },
    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提升用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      // this.getRolesList()
      role.children = res.data;
    },
    //展示分配权限的对话框
    async showSetRightDialog(role){
      this.roleId = role.id
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status!==200){
        return this.$message.error('获取权限失败')
      }
      //把获取到的权限数据保存到data中
      this.rightslist = res.data
      console.log(this.rightslist);
      //递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下三级权限的id，并保存到defKeys数组中
    getLeafKeys(node,arr){
      //如果当前node结点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = []
    },
    //点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      console.log(keys);
      const idStr = keys.join(',')
     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids:idStr
      })
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
