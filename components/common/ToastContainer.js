import Toast from './Toast';

const ToastContainer = ({ toasts, onRemoveToast }) => {
    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            <div className="p-4 space-y-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => onRemoveToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
