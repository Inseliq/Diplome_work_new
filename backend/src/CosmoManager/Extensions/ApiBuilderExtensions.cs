namespace CosmoManager.Extensions;

public static class ApiBuilderExtensions
{
    public static IApplicationBuilder UseApiPipeline(
    this IApplicationBuilder app,
    IHostEnvironment env)
    {

        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
                c.RoutePrefix = "swagger";
            });
        }

        return app;
    }
}
