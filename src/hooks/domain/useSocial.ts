import useSocialStore from '@/store/useSocialStore'
import socialService from '@/services/socialService'

export function useSocial() {
  const {
    friends, incomingRequests, sentRequests, searchResults, isLoading,
    setFriends, setIncomingRequests, setSentRequests, setSearchResults, setLoading,
  } = useSocialStore()

  async function loadSocialDashboard(userId: string): Promise<void> {
    setLoading(true)
    try {
      const [frds, inc, snt] = await Promise.all([
        socialService.getFriends(userId),
        socialService.getPendingRequests(userId),
        socialService.getSentRequests(userId),
      ])
      setFriends(frds)
      setIncomingRequests(inc)
      setSentRequests(snt)
    } finally {
      setLoading(false)
    }
  }

  async function loadFriends(userId: string): Promise<void> {
    const frds = await socialService.getFriends(userId)
    setFriends(frds)
  }

  async function search(query: string, userId: string): Promise<void> {
    if (!query.trim()) { setSearchResults([]); return }
    const results = await socialService.searchUsers(query, userId)
    setSearchResults(results)
  }

  async function sendReq(fromUserId: string, toUserId: string): Promise<void> {
    const req = await socialService.sendFriendRequest(fromUserId, toUserId)
    setSentRequests([...sentRequests, req])
  }

  async function acceptReq(requestId: string): Promise<void> {
    await socialService.acceptRequest(requestId)
    const accepted = incomingRequests.find(r => r.id === requestId)
    setIncomingRequests(incomingRequests.filter(r => r.id !== requestId))
    if (accepted) setFriends([...friends, accepted.user])
  }

  async function rejectReq(requestId: string): Promise<void> {
    await socialService.rejectRequest(requestId)
    setIncomingRequests(incomingRequests.filter(r => r.id !== requestId))
  }

  async function cancelReq(requestId: string): Promise<void> {
    await socialService.cancelRequest(requestId)
    setSentRequests(sentRequests.filter(r => r.id !== requestId))
  }

  return {
    friends, incomingRequests, sentRequests, searchResults, isLoading,
    loadSocialDashboard, loadFriends, search, sendReq, acceptReq, rejectReq, cancelReq,
  }
}
