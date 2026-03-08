import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'

// PrimeVue Components
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import ProgressSpinner from 'primevue/progressspinner'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import OverlayPanel from 'primevue/overlaypanel'
import Menu from 'primevue/menu'
import Tooltip from 'primevue/tooltip'

// PrimeVue CSS
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// App Styles
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark'
    }
  },
  ripple: true
})

app.use(ToastService)

// Register components
app.component('Button', Button)
app.component('Card', Card)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('FileUpload', FileUpload)
app.component('Toast', Toast)
app.component('Tag', Tag)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Textarea', Textarea)
app.component('Calendar', Calendar)
app.component('InputIcon', InputIcon)
app.component('IconField', IconField)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Avatar', Avatar)
app.component('Badge', Badge)
app.component('OverlayPanel', OverlayPanel)
app.component('Menu', Menu)

// Directives
app.directive('tooltip', Tooltip)

app.mount('#app')

