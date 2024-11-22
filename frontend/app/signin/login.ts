'use client'

import { redirect } from 'next/navigation'
// import { cookies } from "next/headers"

export async function login(prevState: any, formData: FormData): Promise<{
    success: boolean | undefined
    message?: string
} | never> {
    const request = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password')
        })
    })

    if (!request.ok) {
        return {
            success: false,
            message: 'Invalid email or password'
        }
    }

    // login successful, redirect to the team page

    redirect('/homepage')
}