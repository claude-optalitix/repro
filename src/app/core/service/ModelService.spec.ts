import { ModelService } from './ModelService'
import { TestBed, async, inject } from '@angular/core/testing';
import { EndpointConfig, Endpoints, RuntimeConfiguration } from '../configuration/RuntimeConfiguration';
import { Logger } from '../../core/service/Logger';
import { ModelDefinition, ModelFile } from '../model/ModelFile';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('NotifyService', () => {
    let service: ModelService;
    let httpMock: HttpTestingController;
    const config = {
        apiUrl: 'https://test.example/',
        logLevel: null,
        api: <Endpoints>{
            local: <EndpointConfig>{
                endpoint: 'https://test.example/',
                upsert: 'upsert',
                config: 'config'
            }
        }
    };   

    beforeEach(async(() => {        
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: RuntimeConfiguration, useValue: config },
                Logger,
            ],
            declarations: [],
        }).compileComponents();

        service = TestBed.get(ModelService);
        httpMock = TestBed.get(HttpTestingController);
    }));
    afterEach(() => {
        httpMock.verify();
    });

    it('should addModel', async () => {      
        const modelTask =  service.addModel(new ModelFile());
     
        const req = httpMock.expectOne("https://test.example/upsert");
        expect(req.request.method).toBe("POST");

        req.flush(new ModelDefinition());
        const model = await modelTask;
        
        console.log('model', model);
        expect(model).not.toBeNull();
    });

    it('should getConfig', async () => {      
        const configTask =  service.getConfig("iddad");
     
        const req = httpMock.expectOne("https://test.example/config");
        expect(req.request.method).toBe("GET");

        req.flush({});
        const config = await configTask;
        
        console.log('model', config);
        expect(config).not.toBeNull();
    });
});