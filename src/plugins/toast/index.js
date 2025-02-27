import Toast, { POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"

export const toastOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
}

export const setupToast = (app) => {
    app.use(Toast, toastOptions)
}