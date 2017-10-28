import LoginPage from './loginPage';

const login = (username, password) => {
  LoginPage.open('login');
  browser.waitUntil(() => {
    return browser.isExisting('body > app-root > app-background > div > app-login-component > div.centered > img')
  }, 50000);
  LoginPage.username.setValue(username);
  LoginPage.password.setValue(password);
  LoginPage.submit();
  browser.pause(1000);
  let firstCheck =  browser.isExisting('body > app-root > app-background > div > app-login-component > div.login > form > div.required > span:nth-child(2) > img') ?
          false : true;
  let secondCheck = false;
  if(firstCheck) secondCheck = browser.isExisting('.navBar') ? true : false;
  if(firstCheck && secondCheck) return true;
  else return false;
};

const toggle = status => {
  browser.waitUntil('.routerDiv', 20000);
  browser.pause(1000);
  const relays = $$('.relay div');
  const val = browser.elements('[name*=isActive]').value;

  let elem = [];

  switch (status) {
    case 'on':
      elem = val.filter(el => !el.isSelected())
                .map((el, index) => {
                  relays[el.index].click();
                });
                return 'on'
    case 'off':
      elem = val.map((el, index) => {
        relays[el.index].click();
      });
      return 'off'
  }
}

const toggleHomeLights = status => {
    browser.waitUntil('.container', 20000);
    browser.pause(500);
    const elements = $$('/html/body/app-root/app-background/div/app-home/div/div');
    let elemsOff = [$('/html/body/app-root/app-background/div/app-home/div/div/div[2]/div/img[1]'),
                    $('/html/body/app-root/app-background/div/app-home/div/div/div[1]/img')];
    let elemsOn = [$('/html/body/app-root/app-background/div/app-home/div/div/div[1]/img'),
                   $('/html/body/app-root/app-background/div/app-home/div/div/div[2]/div/img[2]')]
    let bulbStat = $('/html/body/app-root/app-background/div/app-home/div/div');
    let flowerStat = $('body > app-root > app-background > div > app-home > div > div > div:nth-child(2)');

    switch (status) {
      case 'on':
        elemsOff.map(el => el.click());
        browser.pause(2000);
        if(bulbStat.getAttribute('ng-reflect-ng-switch') && flowerStat.getAttribute('ng-reflect-ng-switch')) {
          return 'on'
        } else {
          return 'error'
        };
      case 'off':
        elemsOn.map(el => el.click());
        browser.pause(2000);
        if(!bulbStat.getAttribute('ng-reflect-ng-switch') && !flowerStat.getAttribute('ng-reflect-ng-switch')){
          return 'off'
        } else {
          return 'error'
        };
      }
}


 describe('Login Form', () => {
   it('should deny access with wrong credentials', () => {
     expect(login('dom', 'klim')).to.be.false;
   });

   it('should allow access with correct credentials', () => {
     expect(login('admin', 'admin')).to.be.true;
   });
 })

 describe('App: ', () => {
     it('should show devices', () => {
       browser.click(('[ng-reflect-router-link="./devices"]'));
       browser.waitUntil('.container', 20000);
       expect(browser.isExisting('.container')).to.be.true
     })

     it('should turn relays on', () => {
         expect(toggle('on')).to.equal('on');
     })

     it('should turn relays off', () => {
         expect(toggle('off')).to.equal('off');
       })

     it('should show users', () => {
       browser.click(('[ng-reflect-router-link="./users"]'));
       browser.waitUntil('.container', 20000);
       expect(browser.isExisting('.container')).to.be.true;
     });

     it('should show about', () => {
       browser.click(('[ng-reflect-router-link="./about"]'));
       browser.waitUntil('.qrCode', 20000);
       expect(browser.isExisting('.qrCode')).to.be.true;
     });
   
     it('should show home', () => {
       browser.click(('[ng-reflect-router-link="./home"]'));
       browser.waitUntil('.bedroom', 20000);
       expect(browser.isExisting('.bedroom')).to.be.true;
     });

      it('should turn lights on - Home tab', () => {
        expect(toggleHomeLights('on')).to.equal('on');
      });

      it('should turn lights off - Home tab', () => {
        expect(toggleHomeLights('off')).to.equal('off');
      })

     it('should log out successfully', () => {
       browser.click(('.logOut'));
       browser.waitUntil('<app-login-component>', 20000);
       expect(browser.isExisting('<app-login-component>')).to.be.true;
     });
 })
