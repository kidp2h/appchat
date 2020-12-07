let resultAvatar = null;
let srcAvatar = null;
let resultImageToSend = null;
let currentFriendChat = null;

const collectionUser = JSON.parse($(".userRecord").val())

const peer = new Peer({
        key : "peerjs",
        host:"peerjs-server-trungquandev.herokuapp.com",
        secure:true,
        port:443,
        debug:3
    })
let getPeerId = ""
let isTyping = false;
let timeout = undefined;

let timerInterval

let socket = io();

$(".lds-hourglass").hide();

function scrollBoxChat() {
    $('.contentBoxChat').scrollTop($('.contentBoxChat').prop("scrollHeight"));
}

$(document).ready(function() {
    /**
     * PeerJs
     */
     peer.on("open",function(peerId){
         getPeerId =  peerId
     })

    $('#chat1 *').prop('disabled', true);
    /**
     * FUNCTIONS
     * Update Infomation - updateInfoAjax()
     * Send Text - sendText()
     * Handle SendMessage handleSendMessage()
     * Handle Typing
     */
    function updateInfoAjax(data) {
        $.ajax({
            type: "POST",
            url: "/users/updateInfo",
            data: data,
            beforeSend: function() {
                $(".lds-hourglass").show();
            },
            success: function(response) {
                if (response.message) {
                    if (data.gender && response.message) {
                        swal.fire("Thông báo", "Giới tính đã được cập nhật, mật khẩu không thể cập nhật vì mật khẩu hiện tại nhập không đúng", "warning")
                    }
                } else {
                    swal.fire("Thông báo", "Cập nhật thành công", "success");
                }
            },
            complete: function() {
                // Hide image container
                $(".lds-hourglass").hide();
            }
        });
    }

    function sendText(data) {

        $(".textAreaChat").val("");

        socket.emit("client_sendMessage", data);
        if (collectionUser._id == data.senderId) {
            contentBox = `<div class="message me">
                <di nbcv class="text-main">
                    <div class="text-group me">
                        <div class="text me">
                            <p>${data.message}</p>
                        </div>
                    </div>
                    <span>${data.time}</span>
                </div>
            </div>`
        } else {
            contentBox =
                `<div class="message">
               <img class="avatar-md" src="${data.currentUserFriend.avatarFriend}"
                   data-toggle="tooltip" data-placement="top" alt="avatar">
               <div class="text-main">
                   <div class="text-group">
                       <div class="text">
                          <p>${data.message}</p>
                       </div>
                   </div>
                   <span>${data.time}</span>
               </div>
            </div>`
        }
        $(".contentChat .allMessage").append(contentBox);
        scrollBoxChat()

        $.ajax({
            type: 'POST',
            url: '/messages/sendMessage',
            data: data,
            success: (response) => {

            }
        })
    }

    function typingTimeout() {
        isTyping = false
        socket.emit('client_typing', {
            contactId: currentFriendChat.contactId,
            typing: false
        })
    }

    async function handleSendMessage() {
        if (currentFriendChat == null) {

        } else {

            let message = filterXSS($(".textAreaChat").val()).trim();

            let data = {
                senderId: collectionUser._id,
                usernameSender: collectionUser.username,
                currentUserFriend: currentFriendChat,
                message: message,
                time: moment().format('LT'),
                isTyping: false
            }
            if (message == "") {

            } else if (message != "") {
                sendText(data);
                scrollBoxChat();
            }
        }


    }
    /**
     * WebRTC video call
     */
    function openStream() {
        const config = {
            audio: false,
            video: true
        }
        let result = navigator.mediaDevices.getUserMedia(config)
        return result;
    }
    function closeStream(stream){
        return stream.getTracks().forEach(track => track.stop())
    }
    function playStream(idVideoTag, stream) {
        const video = document.getElementById(idVideoTag)
        video.srcObject = stream;
        video.onloadeddata = function (){
            video.play();
        }
    }

    /**
     * CONTACT
     * - Add Friends
     * - Accept Request Friends
     */

    // Add Friends
    $(".add_friend").click(function(e) {
        $(this).parent().parent().remove();
        let contactId = $(this).attr("contactId");
        let dataToEmit = {
            contactId: $.trim(contactId)
        }
        socket.emit("client_addFriend", contactId);
        $.ajax({
            type: "POST",
            url: "/users/addContact",
            data: {
                userId: $.trim(collectionUser._id),
                contactId: $.trim(contactId)
            },
            success: function(response) {

            }
        });

    });

    // Accept Request Friends
    $(document).on("click", ".btn-accept-request", function(e) {
        $(this).parent().parent().remove();
        let contactId = $(this).attr("contactId");
        let avatarOfContact = ($(this).parent().parent().find("img")).attr("src")
        let usernameContact = ($(this).parent().parent().find("img")).attr("data-original-title")
        let genderContact = ($(this).parent().parent().find("img")).attr("gender");

        let newFriend =
            `<a href="#" class="filterMembers isFriend online contact" data-toggle="list">
             <img class="avatar-md" src="${avatarOfContact}" data-toggle="tooltip"
                 data-placement="top" title="${usernameContact}" alt="avatar">
             <div class="data">
                 <h5>${usernameContact}</h5>
             </div>
             <div class="person-add">
                 <i class="material-icons" contactId="${contactId}">chat</i>
             </div>
         </a>`
        $(".newRequest").prepend(newFriend);
        let newUserChat =
            `<a href="#list-chat" contactId="${contactId}" username="${usernameContact}" avatar="${avatarOfContact}" class="filterDiscussions all single chatWithSomeOne"
             id="list-chat-list" role="tab" >
             <img class="avatar-md avatarUser" src="${avatarOfContact}" data-toggle="tooltip" data-placement="top" title="${usernameContact}" alt="avatar">
             <div class="data">
                 <h5 class="usernameFriend">${usernameContact}</h5>
                 <p>Gender : ${genderContact}</p>
             </div>
         </a>`
        $(".listUserChat").prepend(newUserChat)
        let data = {
            contactId: contactId,
            avatarOfContact: avatarOfContact,
            usernameContact: usernameContact,
            genderContact: genderContact,
            userId: collectionUser._id,
            currentAvatarUser: collectionUser.avatar,
            username: collectionUser.username,
            gender: collectionUser.gender
        }


        socket.emit("client_acceptRequest", data);
        $.ajax({
            type: "POST",
            url: "/users/acceptRequest",
            data: {
                userId: $.trim(collectionUser._id),
                contactId: $.trim(contactId)
            },
            success: function(response) {}
        });

    })
    /**
     * MESSAGE
     * Send Text
     * Send Image
     * Send Emoji
     * Video Call
     */
    $(".sendImage").bind("change", function(e) {
        let infoFile = $(this).prop("files")[0];
        let extFile = ["image/jpeg", "image/jpg", "image/png"];
        let data = {
            senderId: collectionUser._id,
            currentUserFriend: currentFriendChat,
            time: moment().format('LT'),
        }
        const limitFileImage = 1048576;
        if (infoFile.size > limitFileImage) {
            swal.fire("Thông báo", "Ủa có đúng file ảnh không zạ ??. Ảnh dưới 1MB thôi !!", "warning")
        }
        if ($.inArray(infoFile.type, extFile) == -1) {
            swal.fire("Thông báo", "Ủa có đúng file ảnh không zạ ??", "warning");
        }
        if (typeof(FileReader) != undefined) {
            let fileReader = new FileReader();
            fileReader.onload = (file) => {
                let srcImageToSend = file.target.result;
                data.message = srcImageToSend;
                socket.emit("client_sendImage", data);
                let contentMessage =
                    `<div class="message me">
                    <div class="text-main">
                        <div class="text-group me">
                            <div class="text me img_cont_msg">
                                <img src="${srcImageToSend}" style="width:350px">
                            </div>
                        </div>
                        <span>${data.time}</span>
                    </div>
                </div>`

                $(".contentChat .allMessage").append(contentMessage);

            }

            fileReader.readAsDataURL(infoFile)
            let formData = new FormData();
            formData.append("send_image", infoFile);
            resultImageToSend = formData;
        }


        $.ajax({
            type: 'POST',
            url: `/messages/sendPicture/${data.senderId}/${data.receiverId}`,
            cache: false,
            contentType: false,
            processData: false,
            data: resultImageToSend,
            success: (response) => {

            },
            complete: (response) => {
                srcImageToSend = null;
                resultImageToSend = null;
                formData = null;
            }
        })
    })
    // handle event when user click to chat
    $(document).on('click', '.chatWithSomeOne', function(e) {
        $('#chat1 *').prop('disabled', false);
        let idFriend = $(this).attr("contactId");
        let usernameFriend = $(this).attr("username");
        let avatar = $(this).attr("avatar");
        //currentFriendChat.contactId = idFriend;
        currentFriendChat = {
            usernameFriend: usernameFriend,
            contactId: idFriend,
            avatarFriend: collectionUser.avatar
        }

        $(".avatarInChat").attr("src", avatar);
        $(".avatarInChat").attr("data-original-title", usernameFriend);
        $(".avatarInChat").attr("title", usernameFriend);
        $(".usernameInChat").text(usernameFriend);

        $.ajax({
            type: "POST",
            url: `/messages/getConversation/${collectionUser._id}/${idFriend}`,
            data: {
                avatar: avatar
            },
            beforeSend: function() {
                $(".lds-hourglass").show();
            },
            success: function(response) {
                $(".contentChat .allMessage").html("");
                $(".contentChat .allMessage").append(response);
                scrollBoxChat()
            },
            complete: function() {
                $(".lds-hourglass").hide();
            }
        });
    })
    // handle send message
    $('.textAreaChat').on('keydown', function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault()
        }
        if (event.which != "13") {
            isTyping = true;
            socket.emit("client_typing", {
                contactId: currentFriendChat.contactId,
                isTyping: isTyping
            })
            clearTimeout(timeout)
            timeout = setTimeout(typingTimeout, 1500)
        } else {
            handleSendMessage();
        }
    });

    $(".sendMessage").bind("click", (e) => {
        clearTimeout(timeout)
        handleSendMessage();
    })

    $(".emoji").click(function(event) {
        event.preventDefault();
        let emoji = $(this).html();
        $(".textAreaChat").val($(".textAreaChat").val() + " " + emoji + " ");
    })

    function openStream() {
        const config = {
            audio: false,
            video: true
        }
        let result = navigator.mediaDevices.getUserMedia(config)
        return result;
    }

    function playStream(idVideoTag, stream) {
        const video = document.getElementById(idVideoTag)
        video.srcObject = stream;
        video.play();
    }

    peer.on('open', function(id) {
        myPeerId = id;

    });
    $(document).on('click', '.videoCall', function(event) {
        socket.emit("client_checkContactIsOnline", {listener : currentFriendChat,caller : collectionUser});
    });


    $(".btn-logout").click(function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Đăng xuất',
            text: "Bạn có muốn đăng xuất không ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất'
        }).then((result) => {
            if (result.value) {
                $(location).attr('href', window.location.origin + "/users/logout")
            }
        })
    });

    /**
     * AVATAR USER & INFOMATION USER
     * Upload Avatar
     * Check Image
     * Update Infomation
     */
    $(".input_upload_avatar").bind("change", function(e) {
        let infoFile = $(this).prop("files")[0];
        let extFile = ["image/jpeg", "image/jpg", "image/png"];
        const limitFileImage = 1048576;
        if (infoFile.size > limitFileImage) {
            swal.fire("Thông báo", "Ủa có đúng file ảnh không zạ ??. Ảnh dưới 1MB thôi !!", "warning")
        }
        if ($.inArray(infoFile.type, extFile) == -1) {
            swal.fire("Thông báo", "Ủa có đúng file ảnh không zạ ??", "warning");
        }
        if (typeof(FileReader) != undefined) {
            let fileReader = new FileReader();
            fileReader.onload = (file) => {
                $(".image_preview_upload").attr('src', file.target.result);
                srcAvatar = file.target.result;
            }
            fileReader.readAsDataURL(infoFile)
            let formData = new FormData();
            formData.append("avatar", infoFile);
            resultAvatar = formData;
        }
    });

    $(".apply_uploadAvatar").bind("click", (e) => {
        e.preventDefault();
        if (resultAvatar) {
            $.ajax({
                type: "POST",
                url: "/users/uploadAvatar",
                cache: false,
                contentType: false,
                processData: false,
                data: resultAvatar,
                beforeSend: function() {
                    $(".lds-hourglass").show();
                },
                success: function(response) {
                    $(".avatar-profile").attr('src', srcAvatar);
                    swal.fire("Thông báo", "Cập nhật ảnh đại diện thành công !!", "success");
                    resultAvatar == null;
                },
                complete: function() {
                    // Hide image container
                    $(".lds-hourglass").hide();

                }
            });
        }
    })

    $(".updateInfo").bind("click", (e) => {
        let oldPwd = filterXSS($(".oldPwd").val());
        let newPwd = filterXSS($(".newPwd").val());
        let gender = filterXSS($(".gender").val());
        if (oldPwd == "" && newPwd == "" && gender == "") {
            // do nothing
        } else if (oldPwd != "" && newPwd != "" && gender != "") {
            //update all
            if (oldPwd == newPwd) {
                swal.fire("Thông báo", "Mật khẩu mới không được trùng mật khẩu hiện tại !!", "warning");
            } else if (gender != "male" && gender != "female") {
                swal.fire("Thông báo", "Giới tính không hợp lệ !!", "warning");
            } else {
                if (newPwd.length < 4) {
                    swal.fire("Thông báo", "Mật khẩu quá ngắn !!", "warning");
                } else {
                    if (oldPwd == "" || newPwd == "") {
                        swal.fire("Thông báo", "Để đổi mật khẩu hãy nhập cả mật khẩu hiện tại và mật khẩu mới", "warning");
                    } else {
                        let info = {
                            currentPwd: oldPwd,
                            password: newPwd,
                            gender: gender
                        }
                        updateInfoAjax(info);
                    }

                }
            }
        } else if (gender != "") {
            if (gender != "male" && gender != "female") {
                swal.fire("Thông báo", "Giới tính không hợp lệ !!", "warning");
            } else {
                let info = {
                    gender: gender
                }
                updateInfoAjax(info);
            }
        } else {
            //update password
            if (oldPwd == newPwd) {
                swal.fire("Thông báo", "Mật khẩu mới không được trùng mật khẩu hiện tại !!", "success");
            } else {
                if (oldPwd == "" || newPwd == "") {
                    swal.fire("Thông báo", "Để đổi mật khẩu hãy nhập cả mật khẩu hiện tại và mật khẩu mới", "warning");
                } else {
                    let newPassword = {
                        currentPwd: oldPwd,
                        password: newPwd
                    }
                    updateInfoAjax(newPassword);
                }
            }
        }
    })


    // ------------------ Socket.io Listen ------------------------ //


    /**
     * on event about send message , image
     */
    socket.on("server_sendMessage", (dataFromSocket) => {
        if (currentFriendChat.contactId == dataFromSocket.senderId) {
            if (dataFromSocket.isTyping == false) {
                $(".typingChat").css('display', 'none');
                scrollBoxChat()
            } else if (currentFriendChat == null) {
                $(".typingChat").css('display', 'none');
                scrollBoxChat()
            } else {
                $(".typingChat").css('display', 'block');
                scrollBoxChat()
            }
            if (currentFriendChat == null || currentFriendChat == undefined) {
                iziToast.info({
                    position: "bottomRight",
                    title: 'Notification',
                    message: `<b>${dataFromSocket.usernameSender}</b> : ${dataFromSocket.message}`,
                });
            } else {
                if (collectionUser._id == dataFromSocket.senderId) {
                    contentBox = `<div class="message me">
                         <div class="text-main">
                             <div class="text-group me">
                                 <div class="text me">
                                     <p>${dataFromSocket.message}</p>
                                 </div>
                             </div>
                             <span>${dataFromSocket.time}</span>
                         </div>
                     </div>`
                } else {
                    contentBox =
                        `<div class="message">
                        <img class="avatar-md" src="${dataFromSocket.currentUserFriend.avatarFriend}"
                            data-toggle="tooltip" data-placement="top" alt="avatar">
                        <div class="text-main">
                            <div class="text-group">
                                <div class="text">
                                   <p>${dataFromSocket.message}</p>
                                </div>
                            </div>
                            <span>${dataFromSocket.time}</span>
                        </div>
                     </div>`
                }
                $(".contentChat .allMessage").append(contentBox);
                scrollBoxChat()
            }
        }



    })
    socket.on("server_sendImage", (data) => {

        if (currentFriendChat.contactId == data.senderId) {
            if (currentFriendChat == null || currentFriendChat == undefined) {
                iziToast.info({
                    position: "bottomRight",
                    title: 'Notification',
                    message: `${data.username} : đã gửi một ảnh`,
                });
            } else {
                if (collectionUser._id == data.senderId) {
                    contentBox = `<div class="message me">
                     <div class="text-main">
                         <div class="text-group me">
                             <div class="text me">
                                 <img src="${data.message}" style="width:350px">
                             </div>
                         </div>
                         <span>${data.time}</span>
                     </div>
                 </div>`
                } else {
                    contentBox =
                        `<div class="message">
                    <img class="avatar-md" src="${data.currentUserFriend.avatarFriend}"
                        data-toggle="tooltip" data-placement="top" alt="avatar">
                    <div class="text-main">
                        <div class="text-group">
                            <div class="text">
                               <img src="${data.message}" style="width:350px">
                            </div>
                        </div>
                        <span>${data.time}</span>
                    </div>
                 </div>`
                }
                $(".contentChat .allMessage").append(contentBox);
                scrollBoxChat()
            }
        }
    })

    socket.on("server_typing", data => {
        if (currentFriendChat == null || currentFriendChat == undefined) {

        } else {
            if (data.isTyping) {
                $(".typingChat").css('display', 'block');
                scrollBoxChat()
            } else {
                $(".typingChat").css('display', 'none');
                scrollBoxChat()
            }
        }
    })

    /**
     * on about event add friend ,accept request
     */
    socket.on("server_addFriend", (data) => {
        let newAppend = `<a href="#" class="filterMembers request_add online contact" data-toggle="list">
         <img class="avatar-md" src="${data.avatar}" data-toggle="tooltip"
             data-placement="top" data-original-title="${data.username}" gender="${data.gender}" alt="avatar">
         <div class="data">
             <h5>${data.username}</h5>
         </div>
         <div class="person-add">
             <i class="material-icons btn-accept-request"
                 contactId="${data._id}">check_circle</i>
         </div>
     </a>`
        iziToast.info({
            position: "bottomRight",
            title: 'Notification',
            message: `${data.username} đã gửi lời mời kết bạn đến bạn !!`,
        });
        $(".newRequest").prepend(newAppend);
    });

    socket.on("server_acceptRequest", data => {
        let newFriend =
            `<a href="#" class="filterMembers isFriend online contact" data-toggle="list">
             <img class="avatar-md" src="${data.currentAvatarUser}" data-toggle="tooltip"
                 data-placement="top" title="${data.username}" alt="avatar">
             <div class="data">
                 <h5>${data.username}</h5>
             </div>
             <div class="person-add">
                 <i class="material-icons btn-accept-request" contactId="<%=item._id%>">check_circle</i>
             </div>
         </a>`
        let newUserChat =
            `<a href="#list-chat" contactId="${data.userId}" username="${data.username}" avatar="${data.currentAvatarUser}" class="filterDiscussions all single chatWithSomeOne"
             id="list-chat-list" role="tab" >
             <img class="avatar-md avatarUser" src="${data.currentAvatarUser}" data-toggle="tooltip" data-placement="top" title="${data.username}" alt="avatar">
             <div class="data">
                 <h5 class="usernameFriend">${data.username}</h5>
                 <p>Gender : ${data.gender}</p>
             </div>
         </a>`
        $(".listUserChat").prepend(newUserChat)

        $(".newRequest").prepend(newFriend);
        iziToast.info({
            position: "bottomRight",
            title: 'Notification',
            message: `${data.username} đã chấp nhận lời mời kết bạn !!`,
        });
    })

    /**
     * on about event call video
     */

    socket.on("server_contactIsOffline",() =>{
        iziToast.info({
            position: "bottomRight",
            title: 'Notification',
            message: `Người dùng này hiện tại chưa có mặt, hãy gọi lại sau !`,
        });
    })

    socket.on("server_requestPeerId",(res) => {
        let dataToEmit = {
            caller : res.caller,
            listener : res.listener,
            listenerPeerId : getPeerId
        }
        socket.emit("client_returnPeerId",dataToEmit)
    })

    socket.on("server_returnPeerId",data => {
        socket.emit("client_requestCall",data);


        Swal.fire({
            title: 'Call',
            html:
            `Bạn đang gọi cho <b>${data.listener.usernameFriend}</b>
            <img src="/images/calling.gif" width="40" height="40">
            <p>
            <button class="btn btn-caller-cancel-call" style="background-color: rgb(221, 51, 51);height:40px;" name="1"><i class="material-icons md-30">call_end</i></button>
            </p>
            `,
            timer: 30000,
            showCancelButton: false,
            showConfirmButton : false,
            timerProgressBar: true,
            cancelButtonColor: '#d33',
            allowOutsideClick: false,
            willOpen: () => {
                socket.emit("client_calling",data);
                timerInterval = setInterval(() => {}, 100)

            },
            didOpen : () => {
                $(".btn-caller-cancel-call").click(() => {
                    Swal.close();
                    socket.emit("client_callerCancelCall",data);
                })
                socket.on("server_listenerCancelCall",data => {
                    Swal.close();
                    clearInterval(timerInterval)
                    Swal.fire('Notification!',`${data.listener.usernameFriend} đã huỷ cuộc gọi !`,'info')
                })

            },
            willClose: () => {
                clearInterval(timerInterval)

            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    title: 'Notification',
                    text: `${data.listener.usernameFriend} đang bận, hãy thử gọi lại sau`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Gọi lại ?',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        $(".videoCall").click();
                    }
                })
            }
        })
    })

    socket.on("server_callingToListener",data => {
        Swal.fire({
            title: 'Call',
            html: `${data.caller.username} đang gọi cho bạn
            <img src="/images/calling.gif" width="40" height="40">
            <p>
            <button class="btn btn-listener-cancel-call" style="background-color: rgb(221, 51, 51);height:40px;" name="1"><i class="material-icons md-30">call_end</i></button>
            <button class="btn btn-listener-accept-call" style="background-color: rgb(48, 133, 214);height:40px;" name="1"><i class="material-icons md-30">call</i></button>
            </p>
            `,
            timer: 30000,
            showCancelButton: false,
            showConfirmButton : false,
            timerProgressBar: true,
            allowOutsideClick: false,
            willOpen: () => {
                timerInterval = setInterval(() => {}, 100)


            },
            didOpen : () => {
                $(".btn-listener-cancel-call").click(() => {
                    Swal.close();
                    socket.emit("client_listenerCancelCall",data);
                })
                $(".btn-listener-accept-call").click(() => {
                    Swal.close();
                    socket.emit("client_listenerAcceptCall",data);
                })
                socket.on("server_callerCancelCall",data => {
                    Swal.close();
                    Swal.fire('Notification!',`${data.caller.username} đã huỷ cuộc gọi !`,'info')

                })

            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {

            }
        })
    })



    socket.on("server_listenerAcceptCall_toCaller",data => {
        Swal.close();
        clearInterval(timerInterval)
        console.log(data)
        // handle caller MARK
        openStream().then(stream => {
            playStream('userVideo',stream);
            const call = peer.call(data.listenerPeerId,stream);
            call.on("stream", contactStream => playStream("contactVideo",contactStream))
            $(".call-end").click(() => {
                socket.emit("client_callerEndCall",data);
                closeStream(stream);
                Swal.fire('Call',`Đã kết thúc cuộc gọi với ${data.listener.usernameFriend}`,'info')
            })
            socket.on("server_listenerEndCall_toCaller",data => {
                closeStream(stream);
                $("#call1").hide();
                $("#chat1").show();
                Swal.fire('Call',`${data.listener.usernameFriend} đã kết thúc cuộc gọi !`,'info')

            })
        },(err) => {
            Swal.fire('Call',`Bạn chưa mở camera hoặc thiết bị của bạn không hỗ trợ`,'error')
            $("#chat1").show()
            $("#call1").hide()
        })
    })

    socket.on("server_listenerAcceptCall_toListener",(data)=> {
        Swal.close();
        clearInterval(timerInterval)
        $("#chat1").hide()
        $("#call1").show()
        // handle listener MARK
        peer.on('call', function(call) {
            openStream().then(stream => {
                playStream("userVideo",stream)
                call.answer(stream);
                call.on("stream", (contactStream) => playStream("contactVideo",contactStream))
                $(".call-end").click(() => {
                    closeStream(stream);
                    socket.emit("client_listenerEndCall",data)
                    Swal.fire('Call',`Đã kết thúc cuộc gọi với ${data.caller.username}`,'info')
                })
                socket.on("server_callerEndCall_toListener",data => {
                    closeStream(stream);
                    $("#call1").hide();
                    $("#chat1").show();
                    Swal.fire('Call',`${data.caller.username} đã kết thúc cuộc gọi !`,'info')
                })
            },(err) => {
                Swal.fire('Call',`Bạn chưa mở camera hoặc thiết bị của bạn không hỗ trợ`,'error')
                $("#chat1").show()
                $("#call1").hide()
            })
        });
    })
});
