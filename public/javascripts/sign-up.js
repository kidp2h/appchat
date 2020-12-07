$(document).ready(function () {
    $(".lds-hourglass").hide();
    $(document).ajaxStart(function() {
        // Show image container
        $(".lds-hourglass").show();
    });
    $(document).ajaxComplete(function() {
        // Hide image container
        $(".lds-hourglass").hide();
    });
    $(".signup-btn").click(function (e) {
        e.preventDefault()
        let username = filterXSS($("#inputUsername").val());
        username = username.replace(/[^\w\s]/gi, '') // filter character special
        let password = filterXSS($("#inputPassword").val());
        let retypePwd = filterXSS($("#inputRetypePwd").val());
        let captchaRes = grecaptcha.getResponse();
        if(username == null || username == "" || password == null || password == "" || retypePwd == null || retypePwd == "" || captchaRes == ""){

        }else if(password == null || password == ""){

        }else if(retypePwd == null || retypePwd == ""){

        }else if(password != retypePwd ){
            swal.fire("Thông báo", "Sao hai mật khẩu khác nhau thế ?", "warning");
        }else if(captchaRes == null || captchaRes == ""){
            swal.fire("Thông báo", "Captcha bạn eyyy :))", "warning");
        }else{
            $(".signup-btn").prop("disabled", true)
            $.ajax({
                type: "post",
                url: "/users/register",
                data: {
                    username: username,
                    password: password,
                    retypePwd: retypePwd,
                    captchaRes: captchaRes
                },
                success: function (response) {
                    if (response.responseCode == 0 && response.register == true) {
                        swal.fire("Thông báo", "Đăng ký thành công", "success").then(result => {
                            if(result.value){
                                console.log(result);
                                $(location).attr('href', window.location.origin + "/users/signin.p2h")
                            }
                        })

                    } else {
                        swal.fire("Thông báo", response.msg, "error")
                        $(".signup-btn").prop("disabled", false)
                    }
                }
            });
        }
    });
    $("form").submit(function(e){
        return false
     });
});
