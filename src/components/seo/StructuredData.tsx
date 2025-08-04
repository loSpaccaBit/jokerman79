"use client"

interface StructuredDataProps {
    data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function StructuredData({ data }: StructuredDataProps) {
    const jsonLd = Array.isArray(data) ? data : [data];

    return (
        <>
            {jsonLd.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema, null, 0)
                    }}
                />
            ))}
        </>
    );
}

// HOC per aggiungere structured data a qualsiasi componente
export function withStructuredData<T extends Record<string, unknown>>(
    Component: React.ComponentType<T>,
    getSchemaData: (props: T) => Record<string, unknown> | Array<Record<string, unknown>>
) {
    return function StructuredDataWrapper(props: T) {
        const schemaData = getSchemaData(props);

        return (
            <>
                <StructuredData data={schemaData} />
                <Component {...props} />
            </>
        );
    };
}

// Hook per gestire structured data dinamici
export function useStructuredData(data: Record<string, unknown> | Array<Record<string, unknown>>) {
    return {
        structuredData: <StructuredData data={data} />
    };
}
