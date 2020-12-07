$(document).ready(function() {
    $(".lds-hourglass").hide();
    $(document).ajaxStart(function() {
        // Show image container
        $(".lds-hourglass").show();
    });
    $(document).ajaxComplete(function() {
        // Hide image container
        $(".lds-hourglass").hide();
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
                success: function(response) {
                    if (response == 404) {
                        iziToast.error({
                            position: "bottomRight",
                            title: 'Notification',
                            message: 'Có vấn đề về captcha, vui lòng thử lại !!',
                        });
                        $(".signin-btn").prop("disabled", false)
                    } else if (response.success == true) {
                        $(location).attr('href', window.location.origin + "/AppChat")
                    } else {
                        swal.fire("Thông báo", "Tài khoản hoặc mật khẩu không hợp lệ !!!", "error")
                        $(".signin-btn").prop("disabled", false)
                    }
                },
                error: function(response) {
                    if (response.responseText == "Unauthorized") {
                        $(".signin-btn").prop("disabled", false)
                        swal.fire("Thông báo", "Tài khoản hoặc mật khẩu không hợp lệ !!!", "error")
                    }
                }
            });
        }
    });
});
