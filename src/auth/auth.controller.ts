import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {
	private hello;
	constructor() {
		this.hello = 'hello';
	}
}
