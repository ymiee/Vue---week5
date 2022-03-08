import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';

const API_URL = 'https://vue3-course-api.hexschool.io/v2';
const API_PATH = 'ymiee';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

// 讀取外部的資源
loadLocaleFromURL('./zh_TW.json');

// Activate the locale
configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      cartData: {},
      products: [],
      productId: '',
      isLoadingItem: '',  //套用特定按鈕
      formData: {
        user: {
            name: '',
            email: '',
            tel: '',
            address: '',
        },
        message: '',
      },
    };
  },
  //  元件
  components: {
    VForm: Form,  //VForm自己取名的，內容來自const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;裡面的Form
    VField: Field,
    ErrorMessage: ErrorMessage,
  },

  methods: {
    getProducts() {
      axios.get(`${API_URL}/api/${API_PATH }/products/all`)
        .then((res) => {
          this.products = res.data.products;
      });
    },
    openClientModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${API_URL}/api/${API_PATH }/cart`)
        .then((res) => {
          this.cartData = res.data.data;
      });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${API_URL}/api/${API_PATH }/cart`, { data })
        .then((res) => {
          alert(res.data.message);
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = '';        
      });
    },
    deleteCartAll() {
      axios.delete(`${API_URL}/api/${API_PATH }/carts`)
        .then((res) => {
            alert(res.data.message);
            this.addLoading();
            this.getCart();
        })
        .catch((err) => {
            alert(err.data.message);
        });
  },
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${API_URL}/api/${API_PATH }/cart/${id}`)
        .then((res) => {
          alert(res.data.message);
          this.getCart();
          this.isLoadingItem = '';
      });
    },
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${API_URL}/api/${API_PATH}/cart/${item.id}`, { data })
        .then((res) => {
          alert(res.data.message);
          this.getCart();
          this.isLoadingItem = '';
      });
    },
    createOrder() {
      axios.post(`${API_URL}/api/${API_PATH}/order`, { data: this.formData })
        .then((res) => {
          alert(res.data.message);
          this.addLoading();
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : '輸入正確的電話號碼';
    },
    addLoading() {
      let loader = this.$loading.show({
        // Optional parameters
        container: this.fullPage ? null : this.$refs.formContainer,
        canCancel: true,
        onCancel: this.onCancel,
      });
      // simulate AJAX
      setTimeout(() => {
        loader.hide();
      }, 800);
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

// $refs
app.component('product-modal', {
  props: ['id'],
  template: '#clientProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${API_URL}/api/${API_PATH }/product/${this.id}`)
        .then((res) => {
          this.product = res.data.product;
      });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty);
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});

app.use(VueLoading.Plugin);
app.mount('#app');
