import { setupPinia } from './pinia'
import { setupToast } from './toast'

export const setupPlugins = (app) => {
    setupPinia(app)
    setupToast(app)
}