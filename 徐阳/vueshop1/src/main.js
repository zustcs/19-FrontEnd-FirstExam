import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import editor from 'vue-quill-editor'


axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)
Vue.use(editor)
Vue.filter('dataFormat', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
