const nameid = document.getElementById("name")
const emailid = document.getElementById("email")
const phoneid = document.getElementById("phone")
const passid = document.getElementById("password")
const cpassid = document.getElementById("confirm-password")
const error1 = document.getElementById("error1")
const error2 = document.getElementById("error2")
const error3 = document.getElementById("error3")
const error4 = document.getElementById("error4")
const error5 = document.getElementById("error5")
const signform = document.getElementById("signform")

function nameValidateChecking(e){
const nameval = nameid.value
const namepattern = /^[A-Za-z\s]+$/;

if(nameval.trim()==""){
  error1.style.display = "block"
  error1.innerHTML = "Please enter a valid name"
}else if(!namepattern.test(nameval)){
    error1.style.display = "block"
    error1.innerHTML="Name can only contain alphabets and space"
}else{
    error1.style.display="none"
    error1.innerHTML = "";
}

}
 
function emailValidateChecking(e){
    const emailval = emailid.value
    const emailpattern = /^[a-zA-Z0-9._-]+@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})$/

    if(!emailpattern.test(emailval)){
        error2.style.display="block"
        error2.innerHTML="Invalid Formate"
    }else{
        error2.style.display="none"
        error2.innerHTML=""; 
    }

}

function phoneValidateChecking(e){
    const phoneval = phoneid.value
    if(phoneval.trim()==""){
        error3.style.display="block";
        error3.innerHTML="Enter valid phone number"

    }else if(phoneval.length<10||phoneval.length>10){
        error3.style.display ="block"
        error3.innerHTML = "Enter 10 digit"
    }else{
        error3.style.display="none"
        error3.innerHTML="";
    }
}

function passValidateChecking(e){
    const passval = passid.value;
    const cpassval = cpassid.value;
    const alpha = /[a-zA-Z]/;
    const digit = /\d/;
    if(passval.length<8){
        error4.style.display="block"
        error4.innerHTML="Should contain 8 characters"

    }else if(!alpha.test(passval)|| !digit.test(passval)){
     error4.style.display="block"
     error4.innerHTML="Should contain numbers and alphabets "
    }else{
     error4.style.display="none"
     error4.innerHTML="";
    }

    if(passval!==cpassval){
        error5.style.display="block"
        error5.innerHTML="Passwords do not match "
    }else{
        error5.style.display="none"
        error5.innerHTML=""
    }
}




document.addEventListener("DOMContentLoaded",function(){
    signform.addEventListener("submit",function(e){
     nameValidateChecking();
     emailValidateChecking();
     phoneValidateChecking();
     passValidateChecking();

     if(
        !nameid||
        !emailid||
        !phoneid||
        !passid||
        !cpassid||
        !error1||
        !error2||
        !error3||
        !error4||
        !error5||
        !signform
     ){
        console.error("One or more elements not found")
     }
       if(error1.innerHTML ||
          error2.innerHTML||
          error3.innerHTML||
          error4.innerHTML||
          error5.innerHTML

        ){
            e.preventDefault()
        }
    })
})