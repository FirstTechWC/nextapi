export interface API_HEALTH {
    status: string;
    authenticated_as?: string;
    auth_type?: string;
}

export interface USER_DETAILS {
    id: string;
    username: string;
    email: string;
    auth_type: string;
    client_name?: string;
}