import { RuntimeConfiguration } from './RuntimeConfiguration'
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEPLOY_URL } from "./deploy-url";

describe('RuntimeConfiguration', () => {   
    let loader: RuntimeConfiguration;

    beforeEach(() => {       
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [                
                RuntimeConfiguration
                ,{ provide: DEPLOY_URL, useValue: '/' } 
            ]
        });

        loader = TestBed.get(RuntimeConfiguration);
    });

    it('should load', async () => {
        const config = await loader.load();

        expect(config).not.toBeNull();
    });
});