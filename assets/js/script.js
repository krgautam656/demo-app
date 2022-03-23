$(document).ready(function() {
    var arr = ['bg_1.jpg', 'bg_2.jpg', 'bg_3.jpg']

    var i = 0
    setInterval(function() {
        if (i == arr.length - 1) {
            i = 0
        } else {
            i++
        }
        var img = 'url(../assets/images/' + arr[i] + ')'
        $(".full-bg").css('background-image', img)

    }, 4000)

    $("#registration").validate({
        rules: {
            firstName: "required",
            email: {
                required: true,
                email: true
            },
            phoneNumber: {
                required: true,
                digits: true,
                minlength: 10,
                maxlength: 10,
            },
            password: {
                required: true,
                minlength: 5,
            },
            confirmPassword: {
                required: true,
                minlength: 5,
                equalTo: '#password'
            },
            gender: {
                required: true
            }
        },
        messages: {
            firstName: {
                required: "Please enter first name",
            },
            phoneNumber: {
                required: "Please enter phone number",
                digits: "Please enter valid phone number",
                minlength: "Phone number field accept only 10 digits",
                maxlength: "Phone number field accept only 10 digits",
            },
            email: {
                required: "Please enter email address",
                email: "Please enter a valid email address.",
            },
            password: {
                required: "Please enter password"
            },
            confirmPassword: {
                required: "Please enter confirm password"
            },
            dob: {
                required: "Please select Date of Birth"
            },
            gender: {
                required: "Please select Gender"
            }
        },
        errorPlacement: function(error, element) {
            if (element.attr("type") == "radio") {
                error.insertAfter(element.parent('div').next());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: form.method,
                url: '/register',
                data: $(form).serialize(),
                dataType: "json",
                success: (response) => {
                    $('#registration')[0].reset()
                    $('#check').removeClass('text-danger')
                    $('#check').addClass('text-success')
                    $('#check').html(response.message)
                    $(window).scrollTop(0);
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    $('#check').removeClass('text-success')
                    $('#check').addClass('text-danger')
                    $('#check').html(jqXHR.responseJSON.message)
                }
            })
        }
    })

    $("#login").validate({
        rules: {
            userName: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5,
            }
        },
        messages: {
            userName: {
                required: "Please enter email address",
                email: "Please enter a valid email address.",
            },
            password: {
                required: "Please enter password"
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: form.method,
                url: '/login',
                data: $(form).serialize(),
                dataType: "json",
                success: (response) => {
                    $('#login')[0].reset()
                    window.location.href = '/dashboard'
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    document.getElementById("check").innerHTML = jqXHR.responseJSON.message
                }
            })
        }
    })

    $('#datepicker').datepicker({
        uiLibrary: 'bootstrap',
        format: 'dd/mm/yyyy'
    })

    $('#sandbox-container').datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        todayHighlight: true
    });

    $('#usersTable').DataTable({
        'processing': true,
        'serverSide': true,
        ajax: {
            url: '/users',
            method: "GET"
        },
        columns: [{
                data: null,
                sortable: false,
                render: function(data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            }, {
                data: 'firstName'
            },
            {
                data: 'lastName'
            },
            {
                data: 'email'
            },
            {
                data: 'phoneNumber'
            }
        ]
    })

    $.ajax({
        url: '/users',
        success: (response) => {
            $.each(response.data, function(k, v) {
                $('#detailsTable tbody')
                    .append('<tr><td>' + v.firstName + '</td><td>' + v.gender + '</td><td>' + v.email + ' </td><td>' + v.phoneNumber + '</td><td>' + v.dob + '</td></tr>')
            })
        },
        error: (jqXHR, textStatus, errorThrown) => {}
    })
})



var myVar = setInterval(function() { myTimer() }, 500);

function myTimer() {
    $.ajax({
        url: '/details',
        success: (response) => {
            if (typeof response.name != "undefined") {
                $('#detailsTable tbody')
                    .prepend('<tr/>')
                    .children('tr:first')
                    .append('<td>' + response.name._text + '</td><td>' + response.gender._text + '</td><td>' + response.email._text + ' </td><td>' + response.phonenumber._text + '</td><td>' + response.dob._text + '</td>')
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            //document.getElementById("check").innerHTML = jqXHR.responseJSON.message
        }
    })
}