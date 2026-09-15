<div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-5">

  {/* Card */}
  <div className="w-full max-w-[960px] min-h-[650px]
                  bg-white rounded-[30px]
                  overflow-hidden shadow-xl
                  grid lg:grid-cols-2">

    {/* LEFT */}
    <div className="bg-[#345543] text-white p-10 flex flex-col justify-center">

      <span className="text-[#D77A43] font-bold tracking-[4px] text-sm mb-6">
        PET CORNER
      </span>

      <h1 className="text-5xl font-bold leading-tight mb-8">
        Chăm thú <br />
        cưng từ <br />
        những điều <br />
        nhỏ nhất.
      </h1>

      <p className="text-white/80 text-lg leading-8 max-w-[320px]">
        Sản phẩm được chọn kỹ, giao tận nhà và luôn có người đồng hành cùng bạn.
      </p>

    </div>

    {/* RIGHT */}
    <div className="p-10 flex flex-col justify-center">

      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="border rounded-md h-10 text-gray-500 mb-10"
      >
        ← Về trang chủ
      </button>

      <span className="text-[#D77A43] tracking-[3px] text-sm font-bold">
        CHÀO MỪNG TRỞ LẠI
      </span>

      <h2 className="text-5xl font-bold text-[#2E463A] mt-3 mb-3">
        Đăng nhập
      </h2>

      <p className="text-gray-500 mb-8">
        Đăng nhập để tiếp tục chăm sóc người bạn nhỏ của mình.
      </p>

      {/* Email */}
      <div className="mb-5">
        <label className="font-semibold">Email</label>

        <Input
          size="large"
          placeholder="Nhập email của bạn"
          className="mt-2 h-[55px] rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="font-semibold">Mật khẩu</label>

        <Input
          size="large"
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu của bạn"
          className="mt-2 h-[55px] rounded-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          suffix={
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </span>
          }
        />
      </div>

      <div className="text-right mb-6">
        <span
          onClick={() => setIsForgotPasswordModalOpen(true)}
          className="text-[#D77A43] cursor-pointer"
        >
          Quên mật khẩu?
        </span>
      </div>

      {/* Login */}
      <Button
        block
        loading={loading}
        onClick={handleLogin}
        className="!h-[55px]
                  !bg-[#345543]
                  !border-none
                  !rounded-xl
                  !text-white
                  !font-bold"
      >
        Đăng nhập
      </Button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-[1px] bg-gray-200"></div>
        <span className="px-4 text-gray-400">hoặc</span>
        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleOAuthProvider
          clientId={ENV_VARS.VITE_GOOGLE_CLIENT_ID}
        >
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {}}
          />
        </GoogleOAuthProvider>
      </div>

    </div>

  </div>

</div>