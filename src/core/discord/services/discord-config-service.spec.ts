import { DiscordConfigService } from "./discord-config-service";

describe(`Discord Config Service`, () => {
	let service: DiscordConfigService;

	describe(`::getInstance()`, () => {
		it(`should create a DiscordConfigService`, (): void => {
			expect.assertions(1);

			service = DiscordConfigService.getInstance();

			expect(service).toStrictEqual(expect.any(DiscordConfigService));
		});

		it(`should return the created DiscordConfigService`, (): void => {
			expect.assertions(1);

			const result = DiscordConfigService.getInstance();

			expect(result).toStrictEqual(service);
		});
	});

	describe(`:getDiscordToken()`, () => {
		// Safest way to do testing with process.env
		// without breaking anything
		let OLD_ENV: NodeJS.ProcessEnv;

		beforeAll(() => {
			OLD_ENV = process.env;
		});

		afterAll(() => {
			process.env = OLD_ENV;
		});

		beforeEach(() => {
			service = new DiscordConfigService();
			jest.resetModules(); // most important - it clears the cache
			process.env = { ...OLD_ENV };
		});

		it(`should return a non empty non null non undefined string`, () => {
			expect.assertions(3);

			const token = service.getDiscordToken();

			expect(token).not.toHaveLength(0);
			expect(token).not.toBeNull();
			expect(token).toBeDefined();
		});

		describe(`when no DISCORD_TOKEN env variable is specified`, () => {
			beforeEach(() => {
				// use 'delete' to ensure the key is removed, reason :
				// "Assigning a property on process.env will
				// implicitly convert the value to a string."
				// https://nodejs.org/api/process.html#process_process_env
				delete process.env.DISCORD_TOKEN;
			});

			it(`should return the MISSING_TOKEN value from the config`, () => {
				expect.assertions(1);

				const token = service.getDiscordToken();

				expect(token).toStrictEqual(service.MISSING_TOKEN);
			});
		});

		describe(`when a DISCORD_TOKEN env variable is specified`, () => {
			const EXAMPLE_TOKEN = `EXAMPLE.TOKEN.SPECIFIED`;

			beforeEach(() => {
				process.env.DISCORD_TOKEN = EXAMPLE_TOKEN;
			});

			it(`should return the specified token`, () => {
				expect.assertions(1);

				const token = service.getDiscordToken();

				expect(token).toStrictEqual(EXAMPLE_TOKEN);
			});
		});
	});

	describe(`:getSafeToPrintDiscordToken()`, () => {
		let serviceGetDiscordTokenSpy: jest.SpyInstance;

		beforeEach(() => {
			service = new DiscordConfigService();
			serviceGetDiscordTokenSpy = jest
				.spyOn(service, `getDiscordToken`)
				.mockReturnValue(`token`);
		});

		it(`should call getDiscordToken()`, () => {
			expect.assertions(2);

			service.getSafeToPrintDiscordToken();

			expect(serviceGetDiscordTokenSpy).toHaveBeenCalledTimes(1);
			expect(serviceGetDiscordTokenSpy).toHaveBeenCalledWith();
		});

		it(`should return a non empty non null non undefined string`, () => {
			expect.assertions(3);

			const token = service.getSafeToPrintDiscordToken();

			expect(token).not.toHaveLength(0);
			expect(token).not.toBeNull();
			expect(token).toBeDefined();
		});

		describe(`when getDiscordToken return an undefined token`, () => {
			beforeEach(() => {
				serviceGetDiscordTokenSpy = jest
					.spyOn(service, `getDiscordToken`)
					.mockImplementation();
			});

			it(`should throw an Error`, () => {
				expect.assertions(1);

				try {
					service.getSafeToPrintDiscordToken();
				} catch (err) {
					expect(err).toStrictEqual(expect.any(Error));
				}
			});
		});

		describe(`when getDiscordToken return the MISSING_TOKEN value`, () => {
			beforeEach(() => {
				serviceGetDiscordTokenSpy = jest
					.spyOn(service, `getDiscordToken`)
					.mockReturnValue(service.MISSING_TOKEN);
			});

			it(`should return the MISSING_TOKEN token`, () => {
				expect.assertions(1);

				const token = service.getSafeToPrintDiscordToken();

				expect(token).toStrictEqual(service.MISSING_TOKEN);
			});
		});

		describe(`when getDiscordToken return an actual token`, () => {
			const EXAMPLE_TOKEN = `EXAMPLE.TOKEN.SPECIFIED`;

			beforeEach(() => {
				serviceGetDiscordTokenSpy = jest
					.spyOn(service, `getDiscordToken`)
					.mockReturnValue(EXAMPLE_TOKEN);
			});

			it(`should return the specified token censored`, () => {
				expect.assertions(1);

				const token = service.getSafeToPrintDiscordToken();

				expect(token).toStrictEqual(`EXAMPLE.***************`);
			});
		});
	});
});
