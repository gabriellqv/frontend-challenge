import { type ChangeEvent, useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { profileQueryOptions, useChangePassword, useUpdateProfile } from '@/features/account/api'
import { ProfileField } from '@/features/account/components/ProfileField'
import { ProfilePageShell } from '@/features/account/components/ProfilePageShell'
import { ApiError } from '@/shared/api/http-client'
import {
  type ChangePasswordRequest,
  type UpdateProfileRequest,
  changePasswordRequestSchema,
  updateProfileRequestSchema,
} from '@/shared/contracts'
import { getToken } from '@/shared/session'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export const Route = createFileRoute('/perfil')({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: '/login', search: { redirect: '/perfil' } })
  },
  component: ProfilePage,
})

const MAX_AVATAR_BYTES = 256 * 1024
const AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function ProfilePage() {
  const profileQuery = useQuery(profileQueryOptions())
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const fileInput = useRef<HTMLInputElement>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const profileForm = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    values: profileQuery.data
      ? {
          name: profileQuery.data.name,
          username: profileQuery.data.username,
          email: profileQuery.data.email,
          ensName: profileQuery.data.ensName ?? '',
          walletNickname: profileQuery.data.walletNickname ?? '',
          avatarUrl: profileQuery.data.avatarUrl,
        }
      : {
          name: '',
          username: '',
          email: '',
          ensName: '',
          walletNickname: '',
          avatarUrl: null,
        },
  })

  const passwordForm = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  })
  const avatarUrl = useWatch({ control: profileForm.control, name: 'avatarUrl' })

  if (profileQuery.isLoading) {
    return (
      <ProfilePageShell>
        <p role="status" className="font-mono text-sm text-text-secondary">
          Carregando perfil…
        </p>
      </ProfilePageShell>
    )
  }

  const profileError = updateProfile.error instanceof ApiError ? updateProfile.error : null
  const passwordError = changePassword.error instanceof ApiError ? changePassword.error : null
  const profile = profileQuery.data
  const fieldError = (field: keyof UpdateProfileRequest) =>
    profileError?.fields?.[field] ?? profileForm.formState.errors[field]?.message

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!AVATAR_TYPES.has(file.type)) {
      setAvatarError('Use uma imagem PNG, JPEG ou WebP.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('A imagem deve ter no máximo 256 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarError(null)
      profileForm.setValue('avatarUrl', String(reader.result), { shouldDirty: true })
    }
    reader.onerror = () => setAvatarError('Não foi possível ler a imagem.')
    reader.readAsDataURL(file)
  }

  function submitProfile(values: UpdateProfileRequest) {
    updateProfile.mutate({
      ...values,
      ensName: values.ensName?.trim() || null,
      walletNickname: values.walletNickname?.trim() || null,
      avatarUrl: values.avatarUrl || null,
    })
  }

  return (
    <ProfilePageShell>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-[16px] border border-surface-dark bg-surface-card p-5 text-canvas">
          <h2 className="font-mono text-lg font-bold">Dados do colecionador</h2>

          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={profileForm.handleSubmit(submitProfile)}
            noValidate
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-dark bg-surface-raised font-bold">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar do colecionador"
                    className="size-full object-cover"
                  />
                ) : (
                  (profile?.name ?? '?').slice(0, 1).toUpperCase()
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInput.current?.click()}
                  >
                    Alterar avatar
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAvatarError(null)
                        profileForm.setValue('avatarUrl', null, { shouldDirty: true })
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <p className="font-mono text-xs text-text-secondary">
                  PNG, JPEG ou WebP, até 256 KB.
                </p>
                {avatarError && (
                  <p role="alert" className="font-mono text-xs text-error">
                    {avatarError}
                  </p>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  aria-label="Selecionar avatar"
                  onChange={onAvatarChange}
                />
              </div>
            </div>

            <ProfileField
              id="name"
              label="Nome de exibição"
              error={fieldError('name')}
              input={<Input id="name" {...profileForm.register('name')} />}
            />
            <ProfileField
              id="username"
              label="Nome de usuário"
              hint="3 a 20 caracteres: letras minúsculas, números, ponto ou _."
              error={fieldError('username')}
              input={<Input id="username" {...profileForm.register('username')} />}
            />
            <ProfileField
              id="email"
              label="E-mail"
              error={fieldError('email')}
              input={<Input id="email" type="email" {...profileForm.register('email')} />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                id="ensName"
                label="Nome ENS"
                error={fieldError('ensName')}
                input={
                  <Input id="ensName" placeholder="nome.eth" {...profileForm.register('ensName')} />
                }
              />
              <ProfileField
                id="walletNickname"
                label="Apelido da carteira"
                error={fieldError('walletNickname')}
                input={
                  <Input
                    id="walletNickname"
                    placeholder="Principal"
                    {...profileForm.register('walletNickname')}
                  />
                }
              />
            </div>

            {profileError && !profileError.fields && (
              <p role="alert" className="text-sm text-error">
                {profileError.message}
              </p>
            )}

            <Button
              type="submit"
              size="sm"
              className="self-start"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
            {updateProfile.isSuccess && (
              <p role="status" className="text-sm text-success">
                Dados atualizados.
              </p>
            )}
          </form>
        </section>

        <section className="rounded-[16px] border border-surface-dark bg-surface-card p-5 text-canvas">
          <h2 className="font-mono text-lg font-bold">Alterar senha</h2>

          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={passwordForm.handleSubmit((values) =>
              changePassword.mutate(values, { onSuccess: () => passwordForm.reset() }),
            )}
            noValidate
          >
            <ProfileField
              id="currentPassword"
              label="Senha atual"
              error={passwordForm.formState.errors.currentPassword?.message}
              input={
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register('currentPassword')}
                />
              }
            />
            <ProfileField
              id="newPassword"
              label="Nova senha"
              hint="Mínimo de 6 caracteres."
              error={passwordForm.formState.errors.newPassword?.message}
              input={
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register('newPassword')}
                />
              }
            />

            {passwordError && (
              <p role="alert" className="text-sm text-error">
                {passwordError.message}
              </p>
            )}

            <Button
              type="submit"
              size="sm"
              className="self-start"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? 'Alterando…' : 'Alterar senha'}
            </Button>
            {changePassword.isSuccess && (
              <p role="status" className="text-sm text-success">
                Senha alterada.
              </p>
            )}
          </form>
        </section>
      </div>
    </ProfilePageShell>
  )
}
