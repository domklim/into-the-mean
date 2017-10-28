import Page from './page';

class LoginPage extends Page {

  get username() {return browser.element('/html/body/app-root/app-background/div/app-login-component/div[2]/form/div[1]/input')};
  get password() {return browser.element('/html/body/app-root/app-background/div/app-login-component/div[2]/form/div[2]/input')};
  get form() {return browser.element('.btnEnter')}

  open(arg) {
    super.open(arg);
  }

  submit() {
    this.form.click();
  }

}

module.exports = new LoginPage();
