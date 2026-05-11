import { updateUserProfile } from '@/lib/actions/users'
import type { User } from '@/types'

const userService = {
  updateProfile(user: User, data: { name: string; bio: string }): Promise<User> {
    return new Promise(resolve => {
      setTimeout(async () => {
        await updateUserProfile({ id: user.id, name: data.name, bio: data.bio })
        resolve({
          ...user,
          name: data.name.trim() || user.name,
          bio: data.bio.trim() || undefined,
        })
      }, 300)
    })
  },
}

export default userService
