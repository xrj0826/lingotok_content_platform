import { onActivated, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export function useActiveFeature(reload: Function) {
  const route = useRoute();
  const path = ref(route.fullPath);
  let count = 0;
  // 强制更新dom
  onActivated(() => {
    const newPath = route.fullPath;
    console.log(newPath);
    console.log(`计数${count++}`);
    if (newPath !== path.value) {
      path.value = newPath;
      console.error('我重生了');
      reload();
    }
  });
  onMounted(() => {
    reload();
  });
}
