<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 修改用户对话框 -->
      <el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed"
  >
 <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
 label-width="70px" class="demo-ruleForm" status-icon>
  <el-form-item label="商品名称" prop="goods_name">
    <el-input v-model="editForm.goods_name" ></el-input>
  </el-form-item>
   <el-form-item label="商品价格" prop="goods_price">
    <el-input v-model="editForm.goods_price" ></el-input>
  </el-form-item>
   <el-form-item label="商品重量" prop="goods_weight">
    <el-input v-model="editForm.goods_weight" ></el-input>
  </el-form-item>
  <el-form-item label="商品数量" prop="goods_number">
    <el-input v-model="editForm.goods_number" ></el-input>
  </el-form-item>
  

 </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0,
      editDialogVisible:false,
      editForm:{

      },
      editFormRules:{
        goods_name:[{
            required: true,
            message: "请输入名称",
            trigger: "blur",
            }
        ],
        goods_price:[{
            required: true,
            message: "请输入价格",
            trigger: "blur",
            }
        ],
        goods_number:[{
            required: true,
            message: "请输入数量",
            trigger: "blur",
            }
        ],
        goods_weight:[{
            required: true,
            message: "请输入重量",
            trigger: "blur",
            }
        ],
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsList = res.data.goods
      //   console.log(this.goodsList)
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newSize) {
      this.queryInfo.pagenum = newSize
      this.getGoodsList()
    },
    // 通过Id删除商品
    async removeById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    goAddPage () {
      this.$router.push('/goods/add')
    },
    //展示编辑用户的对话框
    async showEditDialog(id){
    const{data:res}= await this.$http.get('goods/'+id)
      console.log('res', res)
      this.editDialogVisible = true
       if (res.meta.status !== 200) {
          this.$message.error("编辑商品信息失败");
        }
        this.editForm=res.data
         this.editDialogVisible = true
    },
     editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        //发起修改用户信息的数据请求
        console.log('object', this.editForm)
        const parma = {
          goods_name:this.editForm.goods_name,
          goods_price:this.editForm.goods_price,
          goods_number:this.editForm.goods_number,
          goods_weight:this.editForm.goods_weight
        }
        console.log('param', parma)
       const {data:res} = await this.$http.put('goods/'+this.editForm.goods_id,parma)
        console.log('res', res)
        if(res.meta.status !==200 ){
          return this.$message.err('更新商品信息失败')

        }
        //关闭对话框
        this.editDialogVisible = false
        //刷新数据列表
        this.getGoodsList()
        //提示修改成功
        this.$message.success('更新商品信息成功')
      })
    },
  }
}
</script>

<style lang="less" scoped>
</style>
