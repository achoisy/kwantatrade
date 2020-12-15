import * as prom from 'prom-client';
import http from 'http';
import url from 'url';

export interface PromOptions {
  serviceName?: string;
  port?: number | string;
  path?: string;
  collectDefaultMetrics?: boolean;
}

export class Prometheus {
  public register: prom.Registry;

  private _httpServer?: http.Server;
  private options: PromOptions;

  private defaultOptions: PromOptions = {
    serviceName: 'app',
    port: 9090,
    path: '/metrics',
    collectDefaultMetrics: true,
  };

  get httpServer() {
    if (!this._httpServer) {
      throw new Error('Cannot acces http server befor server init');
    }
    return this._httpServer;
  }

  constructor(options?: PromOptions) {
    this.register = prom.register;
    this.options = { ...this.defaultOptions, ...options };

    // Set default prometheus metrics
    if (this.options.collectDefaultMetrics) {
      prom.collectDefaultMetrics({
        register: this.register,
      });
    }

    // Set static default labels applied to every metric emitted by a registry
    this.register.setDefaultLabels({ serviceName: this.options.serviceName });

    this.initServer();
  }

  private initServer() {
    this._httpServer = http.createServer(async (req, res) => {
      if (req.url && typeof this.options.path === 'string') {
        const route = url.parse(req.url).pathname;
        if (route === this.options.path) {
          res.setHeader('Content-Type', this.register.contentType);
          res.end(this.register.metrics());
        }
      }
    });
    this._httpServer.listen(this.options.port, () => {
      console.log(
        `Prometheus metrics set on path: ${this.options.path}, port: ${this.options.port}`
      );
    });
  }

  close() {
    return this.httpServer.close();
  }
}
