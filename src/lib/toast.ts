import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent styling and behavior across the app
 */

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '12px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '12px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#1e293b',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '12px',
        padding: '12px 16px',
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Show a promise-based toast that updates based on promise status
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        fontWeight: 600,
        borderRadius: '12px',
        padding: '12px 16px',
      },
      success: {
        style: {
          background: '#10b981',
          color: '#fff',
        },
      },
      error: {
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      },
    });
  },
};

export default showToast;
