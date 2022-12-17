/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DynamicModule,
  ForwardReference,
  Provider,
  Type,
} from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";

export type NestJSModule =
  | Type<unknown>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference<unknown>;

export interface ITestModuleBuilder {
  build(): TestingModuleBuilder | Promise<TestingModuleBuilder>;
  withModule(nestModule: NestJSModule): ITestModuleBuilder;
  withProvider(provider: Provider<unknown>): ITestModuleBuilder;
  withRootProvider(provider: Provider<unknown>): ITestModuleBuilder;
  injectImports(target: Type, imports: NestJSModule[]): ITestModuleBuilder;
  injectProviders(target: Type, imports: Provider[]): ITestModuleBuilder;
}

export class TestModuleBuilder implements ITestModuleBuilder {
  private imports: NestJSModule[] = [];
  private providers: Provider<unknown>[] = [];
  private rootProviders: Provider<unknown>[] = [];

  build(): TestingModuleBuilder {
    class TestModuleInjector {}

    return Test.createTestingModule({
      imports: [...this.imports, {
        module: TestModuleInjector,
        providers: [...this.providers],
        exports: [...this.providers],
        global: true
      }],
      providers: [...this.rootProviders],
    });
  }


  withModule(nestModule: NestJSModule): this {
    this.imports.push(nestModule);
    return this;
  }

  injectImports(targetModule: Type, imports: NestJSModule[]): this {
    const module = this.imports.find((m : any) => m["name"] === targetModule.name) as any;
    if (!module) {
      return this;
    }

    if (module["imports"]) {
      module["imports"] = [...module["imports"], ...imports];
    } else {
      module["imports"] = [...imports];
    }
    return this;
  }

  injectProviders(targetModule: Type, providers: Provider[]): this {
    const module = this.imports.find((m: any) => m["name"] === targetModule.name) as any;
    if (!module) {
      return this;
    }

    if (module["providers"]) {
      module["providers"] = [...module["providers"], ...providers];
    } else {
      module["providers"] = [...providers];
    }
    return this;
  }

  withProvider(provider: Provider<unknown>): this {
    this.providers.push(provider);
    return this;
  }

  withRootProvider(provider: Provider<unknown>): this {
    this.rootProviders.push(provider);
    return this;
  }
}
