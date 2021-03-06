import { Component } from '@angular/core';
import { App,IonicPage, NavController, NavParams } from 'ionic-angular';
import { TostServiceProvider } from '../../providers/tost-service/tost-service';
import { AngularFireAuth } from 'angularfire2/auth';
import { TansectionServiceProvider } from '../../providers/tansection-service/tansection-service';
import { Tansection } from '../../models/tansection';
import { PersonalServiceProvider } from '../../providers/personal-service/personal-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Blockchain } from '../../models/blockchain';
import { LoadingServiceProvider } from '../../providers/loading-service/loading-service';

/**
 * Generated class for the TansectionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tansections',
  templateUrl: 'tansections.html',
})
export class TansectionsPage {

  friends: string = "add";
  tansection:Tansection;
  tansectionsRequest:Tansection[];
  tansectionsApprove:Tansection[];
  blockchain:Blockchain;
  bloclNumber:number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public app:App,
    private Auth:AngularFireAuth,
    public Tost:TostServiceProvider,
    private tansectionService:TansectionServiceProvider,
    private PersonalService:PersonalServiceProvider,
    private blockchainService:BlockchainServiceProvider,
    public loading:LoadingServiceProvider
  ) {
    let uid = localStorage.getItem('UID');
    console.log('uid',uid);

    // this.tansectionService.sendNotificetionTo('hSEwmmeDTzNQnrH0VWstw7wnf1s2','Hello',"ok").then(res=>{
    //   console.log('sendNotificetionTo',res);
    // })
    
    if(uid){
      this.tansectionService.getListTansectionRequest(uid).subscribe(tansec=>{
        console.log('tansecRequest',tansec);
        this.tansectionsRequest = tansec;      
      });
          
      this.tansectionService.getListTansectionApprove(uid).subscribe(tansec=>{
          console.log('tansecApprove',tansec);
          this.tansectionsApprove = tansec;
      });
    }
    
    let blockNumber = '0';
    let time_stamp = new Date().toTimeString();
    console.log(time_stamp);
    let privateKey = btoa('Blockchain:'+time_stamp+':'+blockNumber);
    console.log('btoa',privateKey);
    //let decode = atob(privateKey);
    //console.log('atob',decode);

    this.blockchain = new Blockchain(blockNumber,privateKey,time_stamp,null);
    console.log(this.blockchain);

    console.log(this.blockchain);
    let jsonString =  JSON.stringify(this.blockchain);
    console.log('String',jsonString);
    
    this.blockchainService.generateBlock(this.blockchain).then(res=>{
      console.log("res",res);      
    })
    this.blockchainService.getlastBlock().subscribe(block=>{
      console.log(block.length);
      this.bloclNumber = block.length-1;      
    })
  } 

  approveTansection(tansection:Tansection){
    //console.log(tansection);
    let time_stamp = new Date().toTimeString();
    
    this.tansection = new Tansection(
      this.bloclNumber.toString(),
      time_stamp,
      tansection.uid_request,
      tansection.personal_request,
      tansection.uid_approve,
      tansection.personal_approve,
      'Allowed'
    );
    console.log(this.tansection);
    
    
    
    //Wait, Allowed, Disallow
    this.tansectionService.approveTansection(tansection.$key,this.tansection).then(res=>{

        this.blockchainService.commitTansection(this.bloclNumber.toString(),this.tansection).then(res=>{

        })
        this.tansectionService.sendNotificetionTo(tansection.personal_approve.token,'Reust Transection','Form'+tansection.personal_request.firstName).then(res=>{
          console.log(" QR sendNotificetionTo",res);          
        });     
    })
    this.loading.presentLoading(3000);
  }

  rejectTansection(tansection:Tansection){
    console.log('get',tansection);
    //console.log('get',tansection.$key);
    this.tansection = new Tansection(
      '0000',
      '',
      tansection.uid_request,
      tansection.personal_request,
      tansection.uid_approve,
      tansection.personal_approve,
      'Disallow'
    );
    console.log(this.tansection);
    this.tansectionService.rejectTansection(tansection.$key,this.tansection).then(result=>{
      this.Tost.presentToast('Sucess :'+result);
    }).catch(error=>{
      this.Tost.presentToast('Error :'+error);
    });
  }

  viewTansection(tansection:Tansection){
    console.log(tansection);
    this.navCtrl.push('ViewTansectionPage');
    //this.navParams.   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TansectionsPage');
  }

  logOut(){
    this.Auth.auth.signOut().then(result=>{
        console.log('pass',result);
        localStorage.clear();
        this.navCtrl.setRoot('LoginPage');    
        const root = this.app.getRootNav();
              root.popToRoot();
        
    }).catch(error=>{
      console.log('error',error);
    })
   
  }

}
