export const teamApi = {
  async getTeam(id: string) {
    const response = await fetch(`/api/teams/${id}`);
    if (!response.ok) throw new Error('Failed to fetch team');
    return response.json();
  },

  async createTeam(teamData: { id: string; name: string; ownerId: string; plan: string }) {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  },

  async getMembers(teamId: string) {
    const response = await fetch(`/api/teams/${teamId}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  async addMember(teamId: string, memberData: { userId: string; role: string }) {
    const response = await fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to add member');
    return response.json();
  }
};
