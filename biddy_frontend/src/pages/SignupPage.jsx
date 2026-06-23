import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { UserPlus } from "lucide-react"
import PageContainer from "../components/PageContainer"
import { Field, TextInput } from "../components/FormField"
import { useAuth } from "../contexts/AuthContext"

export default function SignupPage() {
  const navigate = useNavigate()
  const { isAuthenticated, signup } = useAuth()
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const normalizedPhone = form.phone.replaceAll("-", "")
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        phone: normalizedPhone || undefined,
      })
      navigate("/login", {
        replace: true,
        state: { notice: "회원가입이 완료되었습니다. 로그인해 주세요." },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/products" replace />
  }

  return (
    <PageContainer withTabBar={false} className="flex flex-col">
      <main className="flex min-h-screen flex-col justify-center py-10">
        <div className="mb-8">
          <p className="text-xl font-extrabold tracking-tight text-dark">
            Bid<span className="text-teal">dy</span>
          </p>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground">회원가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">거래에 사용할 기본 정보를 입력해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="이메일" required>
            <TextInput
              value={form.email}
              onChange={update("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="비밀번호" required hint="8자 이상">
            <TextInput
              value={form.password}
              onChange={update("password")}
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호"
              minLength={8}
              required
            />
          </Field>

          <Field label="닉네임" required>
            <TextInput
              value={form.nickname}
              onChange={update("nickname")}
              autoComplete="nickname"
              placeholder="2자 이상"
              minLength={2}
              maxLength={50}
              required
            />
          </Field>

          <Field label="전화번호" hint="숫자만 입력 가능">
            <TextInput
              value={form.phone}
              onChange={update("phone")}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="01012345678"
              pattern="\\d{10,11}"
            />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal font-semibold text-teal-foreground disabled:opacity-50"
          >
            <UserPlus size={18} />
            {submitting ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          이미 계정이 있나요?{" "}
          <Link to="/login" className="font-semibold text-teal">
            로그인
          </Link>
        </p>
      </main>
    </PageContainer>
  )
}
