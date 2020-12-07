$(document).ready(function() {
    $(".lds-hourglass").hide();
    $(".signup-btn").click(function(e) {
        e.preventDefault()
        let username = filterXSS($("#inputUsername").val());
        username = username.replace(/[^\w\s]/gi, '') // filter character special
        let password = filterXSS($("#inputPassword").val());
        let retypePwd = filterXSS($("#inputRetypePwd").val());
        let captchaRes = grecaptcha.getResponse();
        if (username == null || username == "" || password == null || password == "" || retypePwd == null || retypePwd == "" || captchaRes == "") {

        } else if (password == null || password == "") {

        } else if (retypePwd == null || retypePwd == "") {

        } else if (password != retypePwd) {
            swal.fire("Thông báo", "Sao hai mật khẩu khác nhau thế ?", "warning");
        } else if (captchaRes == null || captchaRes == "") {
            swal.fire("Thông báo", "Captcha bạn eyyy :))", "warning");
        } else {
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
                beforeSend: function() {
                    $(".lds-hourglass").show();
                },
                success: function(response) {
                    if (response.responseCode == 0 && response.register == true) {
                        swal.fire("Thông báo", "Đăng ký thành công", "success").then(result => {
                            if (result.value) {
                                console.log(result);
                                $(location).attr('href', window.location.origin + "/users/signin.p2h")
                            }
                        })

                    } else {
                        swal.fire("Thông báo", response.msg, "error")
                        $(".signup-btn").prop("disabled", false)
                    }
                },
                complete: function(response){
                    $(".lds-hourglass").hide();
                }
            });
        }
    });

    $(".signin-btn").click(e => {
        e.preventDefault()
        let username = filterXSS($("#inputUsername").val());
        username = username.replace(/[^\w\s]/gi, '') // filter character special
        let password = filterXSS($("#inputPassword").val());
        let captchaRes = grecaptcha.getResponse();
        if (username == null || username == "") {

        } else if (password == null || password == "") {

        } else if (captchaRes == null || captchaRes == "") {
            iziToast.warning({
                position: "bottomRight",
                title: 'Notification',
                message: 'Captcha kìa bạn eyy :))',
            });
        } else {
            $(".signin-btn").prop("disabled", true)
            $.ajax({
                type: "post",
                url: "/users/login",
                data: {
                    username: username,
                    password: password,
                    captchaRes: captchaRes
                },
                beforeSend: function() {
                    $(".lds-hourglass").show();
                },
                success: function(response) {
                    if (response == 404) {
                        iziToast.error({
                            position: "bottomRight",
                            title: 'Notification',
                            message: 'Có vấn đề về captcha, vui lòng thử lại !!',
                        });
                        grecaptcha.reset();
                        $(".signin-btn").prop("disabled", false)
                    } else if (response.success == true) {
                        $(location).attr('href', window.location.origin + "/AppChat")
                    } else {
                        swal.fire("Thông báo", "Tài khoản hoặc mật khẩu không hợp lệ !!!", "error")
                        grecaptcha.reset();
                        $(".signin-btn").prop("disabled", false)
                    }
                },
                error: function(response) {
                    if (response.responseText == "Unauthorized") {
                        $(".signin-btn").prop("disabled", false)
                        swal.fire("Thông báo", "Tài khoản hoặc mật khẩu không hợp lệ !!!", "error")
                        grecaptcha.reset();
                    }
                },
                complete: function(response){
                    $(".lds-hourglass").hide();
                }
            });
        }
    });

    $("form").submit(function(e){
        return false
     });
});
