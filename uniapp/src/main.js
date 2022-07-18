import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import Vant from 'vant'
import uniCrazyRouter from "uni-crazy-router";
import './router'
import 'vant/lib/index.css';
import axiosAll from './axios'
export function createApp() {
	const app = createSSRApp(App);
	for(let i in axiosAll){
		console.log(axiosAll, i)
		app.config.globalProperties['$'+i] = axiosAll[i]
	}
	app.use(Vant).use(uniCrazyRouter)
	return {
		app,
	};
}

