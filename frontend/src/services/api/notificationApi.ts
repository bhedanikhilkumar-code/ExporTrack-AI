export const notificationApi = {
  async getNotifications(userId: string) {
    const response = await fetch(`/api/notifications?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markAsRead(id: string) {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  }
};
