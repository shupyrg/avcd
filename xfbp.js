customElements.define('x-frame-bypass', class extends HTMLIFrameElement {
	static get observedAttributes() {
		return ['src']
	}
	constructor () {
		super()
	}
	attributeChangedCallback () {
		this.load(this.src)
	}
	connectedCallback () {
		this.sandbox = '' + this.sandbox || 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation' // all except allow-top-navigation
	}
	load (url, options) {
		if (!url || !url.startsWith('http'))
			throw new Error(`X-Frame-Bypass src ${url} does not start with http(s)://`)
		this.srcdoc = ``
		this.fetchProxy(url, options, 0).then(res => res.text()).then(data => {
			if (data)
				this.srcdoc = data.replace(/<head([^>]*)>/i, `<head$1>
	<base href="${url}">
	<script>
	// X-Frame-Bypass navigation event handlers
	document.addEventListener('click', e => {
		if (frameElement && document.activeElement && document.activeElement.href) {
			e.preventDefault()
			frameElement.load(document.activeElement.href)
		}
	})
	document.addEventListener('submit', e => {
		if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
			e.preventDefault()
			if (document.activeElement.form.method === 'post')
				frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
			else
				frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
		}
	})
	</script>`)
		}).catch(e => console.error('', e))
	}
	fetchProxy (url, options, i) {
		const proxies = (options || {}).proxies || [
			'https://rankingesport.com:8080/'
		]
		return fetch(proxies[i] + url, options).then(res => {
			if (!res.ok)
				throw new Error(`${res.status} ${res.statusText}`);
			return res
		}).catch(error => {
			if (i === proxies.length - 1)
				throw error
			return this.fetchProxy(url, options, i + 1)
		})
	}
}, {extends: 'iframe'})
