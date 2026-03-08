import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref([])
  
  const setTabs = (newTabs) => {
    tabs.value = newTabs
  }
  
  const addTab = (tab) => {
    tabs.value.push(tab)
  }
  
  const removeTab = (id) => {
    tabs.value = tabs.value.filter(t => t.id !== id)
  }
  
  return {
    tabs,
    setTabs,
    addTab,
    removeTab
  }
})

