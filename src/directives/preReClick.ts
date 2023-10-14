export default (app) => {
  app.directive('preReClick', {
    mounted(el, binding) {
      el.addEventListener('click', () => {
        if (!el.disabled) {
          el.disabled = true;
          setTimeout(() => {
            el.disabled = false;
          }, binding.value || 2000);
        }
      });
    },
  });
};
