'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { postUnAuthorized } from '../../utils/api_utils';
import { useAuthToken } from '../../utils/auth_utils';

const AuthForm = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();
	const { login: authLogin, isAuthenticated } = useAuthToken();

	const [formData, setFormData] = useState({
		username: '',
		password: '',
		confirmPassword: ''
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validation
		if (!formData.username || !formData.password) {
			setError('Please fill in all required fields');
			return;
		}

		if (!isLogin && formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		try {
			if (isLogin) {
				// Login request
				const response = await postUnAuthorized('token/', {
					username: formData.username,
					password: formData.password
				});

				// Use existing auth login function
				authLogin(response.access, response.refresh);

				// Redirect to dashboard
				router.push('/');
			} else {
				// Signup request
				await postUnAuthorized('register/', {
					username: formData.username,
					password: formData.password
				});

				// Auto-login after successful registration
				const loginResponse = await postUnAuthorized('token/', {
					username: formData.username,
					password: formData.password
				});

				authLogin(loginResponse.access, loginResponse.refresh);

				router.push('/');
			}
		} catch (error) {
			setError(error.message || 'Authentication failed');
		}
	};

	// Redirect if already authenticated
	React.useEffect(() => {
		if (isAuthenticated) {
			router.push('/');
		}
	}, [isAuthenticated, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Input
								type="text"
								placeholder="Username"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								className="w-full"
							/>
						</div>
						<div>
							<Input
								type="password"
								placeholder="Password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full"
							/>
						</div>
						{!isLogin && (
							<div>
								<Input
									type="password"
									placeholder="Confirm Password"
									value={formData.confirmPassword}
									onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
									className="w-full"
								/>
							</div>
						)}
						{error && (
							<div className="text-red-500 text-sm">{error}</div>
						)}
						<Button type="submit" className="w-full">
							{isLogin ? 'Login' : 'Sign Up'}
						</Button>
						<div className="text-center">
							<button
								type="button"
								onClick={() => setIsLogin(!isLogin)}
								className="text-blue-500 hover:underline"
							>
								{isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
							</button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default AuthForm;
