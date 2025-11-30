import { H1, H2, Paragraph } from "@/components/ui/type";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/privacy-policy')({

    component: PrivacyPolicy,
})
function PrivacyPolicy() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <H1 className="text-left mb-8">Privacy Policy</H1>
            <Paragraph><strong>Last updated:</strong> 30-11-2025</Paragraph>

            <Paragraph>
                RivInspect is an open source, client-side web tool for previewing and inspecting <code>.riv</code> animation files. This website does not collect, store, or transmit any personal data.
            </Paragraph>

            <H2 className="mt-4 mb-2">File Processing</H2>
            <ul className="list-disc list-inside">
                <li>All <code>.riv</code> files are processed <strong>locally in your browser</strong>.</li>
                <li>Your files are <strong>never uploaded</strong> to any server.</li>
                <li>No file data is stored, transmitted, or logged by RivInspect.</li>
            </ul>

            <H2 className="mt-4 mb-2">No Data Collection</H2>
            <Paragraph>RivInspect does not:</Paragraph>
            <ul className="list-disc list-inside">
                <li>collect analytics or usage metrics,</li>
                <li>use cookies or tracking technologies,</li>
                <li>log IP addresses or device identifiers,</li>
                <li>store any personal information.</li>
            </ul>

            <H2 className="mt-4 mb-2">Hosting</H2>
            <Paragraph>This site is hosted using <strong>GitHub Pages</strong>, which serves static files only and has no server-side processing. GitHub may collect limited, non-personal technical logs as part of their hosting platform. You can review GitHub's privacy statement here:</Paragraph>
            <Paragraph><a className="underline" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank">GitHub General Privacy Statement</a></Paragraph>

            <H2 className="mt-4 mb-2">Open Source</H2>
            <Paragraph>The source code for RivInspect is fully open source. You may inspect the codebase to verify how files are handled:</Paragraph>
            <Paragraph><a className="underline" href="https://github.com/mulaRahul/rivinspect" target="_blank">GitHub Repository</a></Paragraph>
            
            <H2 className="mt-4 mb-2">Contact</H2>
            <Paragraph>If you have questions or concerns about this privacy policy, please open an issue on the GitHub repository.</Paragraph>
        </div>
    );
}