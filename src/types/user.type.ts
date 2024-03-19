export interface UserRegister {
  email: string
  password: string
  name: string
  passwords: string
  confirm_passwords: string
  date_of_birth: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserLogout {
  refresh_token: string
}

export interface UserVerifyEmail {
  token_verify_email: string
}

export interface UserForgotPasswordBody {
  email: string
}

export interface UserResetPasswordBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UserUpdateMeBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  cover_photo?: string
}
