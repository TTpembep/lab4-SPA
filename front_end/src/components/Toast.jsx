import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function showError(message) {
  toast.error(message);
}

export default function Toast() {
  return <ToastContainer />;
}