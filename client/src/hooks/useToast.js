import toast from 'react-hot-toast';

const useToast = () => ({
  success: (msg) => toast.success(msg, { style: { background: '#161B22', color: '#fff', border: '1px solid #00E5A0' } }),
  error: (msg) => toast.error(msg, { style: { background: '#161B22', color: '#fff', border: '1px solid #ef4444' } }),
  info: (msg) => toast(msg, { style: { background: '#161B22', color: '#fff', border: '1px solid #1A73E8' } }),
  loading: (msg) => toast.loading(msg, { style: { background: '#161B22', color: '#fff' } }),
  dismiss: (id) => toast.dismiss(id),
});

export default useToast;
