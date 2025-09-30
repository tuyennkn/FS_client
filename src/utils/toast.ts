// Simple toast utility for notifications

let toastContainer: HTMLDivElement | null = null;

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `px-4 py-2 rounded-lg text-white font-medium transform transition-all duration-300 translate-x-full opacity-0 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
};