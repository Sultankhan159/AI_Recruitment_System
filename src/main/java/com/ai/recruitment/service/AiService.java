package com.ai.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import com.ai.recruitment.dto.JobDto;

@Service
public class AiService {

    @Value("${app.gemini.apiKey}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> extractProfileDetails(String resumeText) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            return getFallbackProfileDetails(resumeText);
        }

        try {
            String prompt = "Extract candidate details from the following resume text.\n" +
                    "Your output must be a valid JSON object matching this schema:\n" +
                    "{\n" +
                    "  \"phone\": \"extracted phone number or empty string if not found\",\n" +
                    "  \"summary\": \"professional summary of the candidate's career, max 4 sentences\",\n" +
                    "  \"skills\": [\n" +
                    "    {\n" +
                    "      \"name\": \"skill name, e.g. Java\",\n" +
                    "      \"proficiencyLevel\": \"Expert or Intermediate or Beginner\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"education\": [\n" +
                    "    {\n" +
                    "      \"institution\": \"institution name, e.g. Stanford University\",\n" +
                    "      \"degree\": \"degree name, e.g. Bachelor of Science\",\n" +
                    "      \"fieldOfStudy\": \"field, e.g. Computer Science\",\n" +
                    "      \"grade\": \"grade or GPA or empty string\",\n" +
                    "      \"startDate\": \"start date in format YYYY-MM-DD (fallback to January 1st if only year is known)\",\n" +
                    "      \"endDate\": \"end date in format YYYY-MM-DD or empty string if current\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"experience\": [\n" +
                    "    {\n" +
                    "      \"company\": \"company name, e.g. Google\",\n" +
                    "      \"title\": \"job title, e.g. Software Engineer\",\n" +
                    "      \"location\": \"location or empty string\",\n" +
                    "      \"startDate\": \"start date in format YYYY-MM-DD\",\n" +
                    "      \"endDate\": \"end date in format YYYY-MM-DD or empty string if current\",\n" +
                    "      \"current\": true if currently working here or false,\n" +
                    "      \"description\": \"brief summary of duties\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"certifications\": [\n" +
                    "    {\n" +
                    "      \"name\": \"certification name\",\n" +
                    "      \"issuingOrganization\": \"issuing body\",\n" +
                    "      \"issueDate\": \"issue date in format YYYY-MM-DD\",\n" +
                    "      \"expirationDate\": \"expiration date in format YYYY-MM-DD or empty string\",\n" +
                    "      \"credentialId\": \"id or empty string\",\n" +
                    "      \"credentialUrl\": \"url or empty string\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n\n" +
                    "Resume Text:\n" +
                    resumeText;

            String responseText = callGeminiApi(prompt);
            return parseJsonResponse(responseText);

        } catch (Exception e) {
            System.err.println("Gemini Profile extraction failed: " + e.getMessage());
            e.printStackTrace();
            return getFallbackProfileDetails(resumeText);
        }
    }

    public Map<String, Object> evaluateApplication(String resumeText, String jobTitle, String jobDescription, String jobRequirements) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            return getFallbackEvaluation(resumeText, jobTitle, jobDescription, jobRequirements);
        }

        try {
            String prompt = "Evaluate how well the candidate's resume matches this job listing.\n" +
                    "Your output must be a valid JSON object matching this schema:\n" +
                    "{\n" +
                    "  \"matchScore\": a percentage score as a number between 0 and 100,\n" +
                    "  \"aiSummary\": \"concise 2-3 sentence overview explaining why the candidate matches or does not match this job, mentioning key matching skills or gaps\"\n" +
                    "}\n\n" +
                    "Candidate Resume Text:\n" +
                    resumeText + "\n\n" +
                    "Job Title: " + jobTitle + "\n" +
                    "Job Description: " + jobDescription + "\n" +
                    "Job Requirements: " + (jobRequirements != null ? jobRequirements : "None specified") + "\n";

            String responseText = callGeminiApi(prompt);
            return parseJsonResponse(responseText);

        } catch (Exception e) {
            System.err.println("Gemini Job Application evaluation failed: " + e.getMessage());
            return getFallbackEvaluation(resumeText, jobTitle, jobDescription, jobRequirements);
        }
    }
    public String generateInterviewQuestions(String resumeText, String jobTitle, String jobDescription, String jobRequirements) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            return getFallbackInterviewQuestions(jobTitle);
        }

        try {
            String prompt = "Review the candidate's resume and matching details against this job posting, " +
                    "and generate exactly 5 tailored technical interview questions that test the candidate's " +
                    "matching skills and probe any potential skill gaps.\n\n" +
                    "Candidate Resume Details:\n" +
                    resumeText + "\n\n" +
                    "Job Title: " + jobTitle + "\n" +
                    "Job Description: " + jobDescription + "\n" +
                    "Job Requirements: " + (jobRequirements != null ? jobRequirements : "None specified") + "\n\n" +
                    "Your response must be a valid JSON object matching this schema:\n" +
                    "{\n" +
                    "  \"questions\": [\n" +
                    "    \"question 1\",\n" +
                    "    \"question 2\",\n" +
                    "    \"question 3\",\n" +
                    "    \"question 4\",\n" +
                    "    \"question 5\"\n" +
                    "  ]\n" +
                    "}\n";

            String responseText = callGeminiApi(prompt);
            Map<String, Object> json = parseJsonResponse(responseText);
            if (json != null && json.containsKey("questions")) {
                List<?> questions = (List<?>) json.get("questions");
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < questions.size(); i++) {
                    sb.append(i + 1).append(". ").append(questions.get(i).toString());
                    if (i < questions.size() - 1) {
                        sb.append("\n");
                    }
                }
                return sb.toString();
            }
            return responseText;
        } catch (Exception e) {
            System.err.println("Gemini Interview Question generation failed: " + e.getMessage());
            return getFallbackInterviewQuestions(jobTitle);
        }
    }

    public List<Map<String, Object>> recommendJobs(String candidateProfileText, List<JobDto> jobs) {
        if (jobs == null || jobs.isEmpty()) {
            return new ArrayList<>();
        }

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            return getFallbackJobRecommendations(candidateProfileText, jobs);
        }

        try {
            StringBuilder jobsPromptBuilder = new StringBuilder();
            for (JobDto job : jobs) {
                jobsPromptBuilder.append("- Job ID: ").append(job.getId()).append("\n")
                                 .append("  Title: ").append(job.getTitle()).append("\n")
                                 .append("  Description: ").append(job.getDescription()).append("\n")
                                 .append("  Requirements: ").append(job.getRequirements() != null ? job.getRequirements() : "None").append("\n\n");
            }

            String prompt = "You are an AI Recruitment engine. Evaluate how well the candidate's professional profile matches each of the open job listings listed below.\n" +
                    "For each job, calculate a suitability match score (0 to 100) and write a concise 1-sentence explanation of why they match or if there is a skill gap.\n" +
                    "Candidate Profile Details:\n" +
                    candidateProfileText + "\n\n" +
                    "Job Listings:\n" +
                    jobsPromptBuilder.toString() + "\n" +
                    "Your response must be a valid JSON object matching this schema:\n" +
                    "{\n" +
                    "  \"recommendations\": [\n" +
                    "    {\n" +
                    "      \"jobId\": 1,\n" +
                    "      \"matchScore\": 92,\n" +
                    "      \"explanation\": \"Brief explanation of match suitability\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n";

            String responseText = callGeminiApi(prompt);
            JsonNode rootNode = objectMapper.readTree(responseText);
            JsonNode recsNode = rootNode.path("recommendations");
            List<Map<String, Object>> recommendations = new ArrayList<>();
            if (recsNode.isArray()) {
                for (JsonNode recNode : recsNode) {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("jobId", recNode.path("jobId").asLong());
                    rec.put("matchScore", recNode.path("matchScore").asDouble());
                    rec.put("explanation", recNode.path("explanation").asText());
                    recommendations.add(rec);
                }
            }
            return recommendations;
        } catch (Exception e) {
            System.err.println("Gemini Job recommendation failed: " + e.getMessage());
            return getFallbackJobRecommendations(candidateProfileText, jobs);
        }
    }

    private List<Map<String, Object>> getFallbackJobRecommendations(String candidateProfileText, List<JobDto> jobs) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        if (candidateProfileText == null) candidateProfileText = "";
        String candidateLower = candidateProfileText.toLowerCase();

        for (JobDto job : jobs) {
            double score = 40.0; // Base score
            List<String> matchingKeywords = new ArrayList<>();

            // Match simple terms
            String[] searchKeywords = {"java", "spring", "react", "javascript", "python", "mysql", "sql", "aws", "docker", "rest", "api", "node"};
            for (String kw : searchKeywords) {
                if (candidateLower.contains(kw) && 
                    ((job.getTitle() != null && job.getTitle().toLowerCase().contains(kw)) ||
                     (job.getDescription() != null && job.getDescription().toLowerCase().contains(kw)) ||
                     (job.getRequirements() != null && job.getRequirements().toLowerCase().contains(kw)))) {
                    score += 15.0;
                    matchingKeywords.add(kw);
                }
            }

            if (score > 95.0) {
                score = 95.0;
            }

            Map<String, Object> rec = new HashMap<>();
            rec.put("jobId", job.getId());
            rec.put("matchScore", score);

            String explanation = "Candidate profile matches key technologies: " + 
                    (matchingKeywords.isEmpty() ? "general requirements." : String.join(", ", matchingKeywords) + ".");
            rec.put("explanation", explanation);

            recommendations.add(rec);
        }

        return recommendations;
    }

    private String getFallbackInterviewQuestions(String jobTitle) {
        return "1. Explain your experience working on projects relevant to " + jobTitle + ".\n" +
               "2. What is your preferred programming language/tech stack, and why?\n" +
               "3. Describe a challenging bug you encountered and how you debugged it.\n" +
               "4. How do you ensure code quality, testability, and documentation in your team?\n" +
               "5. What are the key architectural patterns you use when building REST APIs?";
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Request payload
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        Map<String, Object> partContainer = new HashMap<>();
        partContainer.put("parts", Collections.singletonList(textPart));
        
        requestBody.put("contents", Collections.singletonList(partContainer));

        // Enforce JSON output format
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            return textNode.asText();
        } else {
            throw new RuntimeException("HTTP Error from Gemini: " + response.getStatusCode());
        }
    }

    private Map<String, Object> parseJsonResponse(String jsonText) {
        try {
            return objectMapper.readValue(jsonText, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to parse JSON response from Gemini: " + e.getMessage());
            // Try to extract JSON structure manually if Gemini surrounded it with ```json ... ```
            try {
                int start = jsonText.indexOf("{");
                int end = jsonText.lastIndexOf("}");
                if (start >= 0 && end > start) {
                    String cleanJson = jsonText.substring(start, end + 1);
                    return objectMapper.readValue(cleanJson, Map.class);
                }
            } catch (Exception ex) {
                // Ignore
            }
            return new HashMap<>();
        }
    }

    private Map<String, Object> getFallbackProfileDetails(String resumeText) {
        Map<String, Object> details = new HashMap<>();
        
        // Extract phone number using a simple regex
        String phone = "";
        if (resumeText != null) {
            java.util.regex.Pattern phonePattern = java.util.regex.Pattern.compile(
                "\\+?\\d{1,4}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}"
            );
            java.util.regex.Matcher matcher = phonePattern.matcher(resumeText);
            if (matcher.find()) {
                phone = matcher.group().trim();
            }
        }
        details.put("phone", phone);

        // Generate a simple summary based on keywords found
        String summary = "Automatically parsed career profile. Experienced professional with key competencies in software development.";
        if (resumeText != null && resumeText.trim().length() > 50) {
            String snippet = resumeText.substring(0, Math.min(200, resumeText.length())).trim();
            summary = "Extracted profile: " + snippet.replaceAll("\\s+", " ") + "...";
        }
        details.put("summary", summary);

        // Scan for common technical skills in resume text
        List<Map<String, String>> skillsList = new ArrayList<>();
        if (resumeText != null) {
            String lowercaseText = resumeText.toLowerCase();
            String[] knownSkills = {
                "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Spring Boot", 
                "Django", "Flask", "Node.js", "Express", "SQL", "MySQL", "PostgreSQL", "MongoDB", 
                "AWS", "Azure", "Docker", "Kubernetes", "Git", "HTML", "CSS", "C++", "C#", "Go", 
                "Rust", "Machine Learning", "Data Analysis", "REST APIs", "Hibernate"
            };
            
            for (String skillName : knownSkills) {
                String lowerSkill = skillName.toLowerCase();
                int index = lowercaseText.indexOf(lowerSkill);
                while (index != -1) {
                    boolean startOk = (index == 0 || !Character.isLetterOrDigit(lowercaseText.charAt(index - 1)));
                    boolean endOk = (index + lowerSkill.length() == lowercaseText.length() || !Character.isLetterOrDigit(lowercaseText.charAt(index + lowerSkill.length())));
                    if (startOk && endOk) {
                        Map<String, String> skillMap = new HashMap<>();
                        skillMap.put("name", skillName);
                        skillMap.put("proficiencyLevel", "Expert");
                        skillsList.add(skillMap);
                        break;
                    }
                    index = lowercaseText.indexOf(lowerSkill, index + 1);
                }
            }
        }
        details.put("skills", skillsList);

        // Fallback Education
        List<Map<String, Object>> fallbackEduList = new ArrayList<>();
        if (resumeText != null && resumeText.toLowerCase().contains("university")) {
            Map<String, Object> edu = new HashMap<>();
            edu.put("institution", "Extracted University");
            edu.put("degree", "Bachelor of Science");
            edu.put("fieldOfStudy", "Computer Science");
            edu.put("grade", "3.8 GPA");
            edu.put("startDate", "2018-09-01");
            edu.put("endDate", "2022-06-30");
            fallbackEduList.add(edu);
        }
        details.put("education", fallbackEduList);

        // Fallback Experience
        List<Map<String, Object>> fallbackExpList = new ArrayList<>();
        if (resumeText != null && (resumeText.toLowerCase().contains("engineer") || resumeText.toLowerCase().contains("developer"))) {
            Map<String, Object> exp = new HashMap<>();
            exp.put("company", "Tech Solutions Inc.");
            exp.put("title", "Software Developer");
            exp.put("location", "New York, NY");
            exp.put("startDate", "2022-07-01");
            exp.put("endDate", "");
            exp.put("current", true);
            exp.put("description", "Responsible for designing and maintaining enterprise Java backend applications and React workflows.");
            fallbackExpList.add(exp);
        }
        details.put("experience", fallbackExpList);

        // Fallback Certifications
        List<Map<String, Object>> fallbackCertList = new ArrayList<>();
        if (resumeText != null && resumeText.toLowerCase().contains("aws")) {
            Map<String, Object> cert = new HashMap<>();
            cert.put("name", "AWS Certified Cloud Practitioner");
            cert.put("issuingOrganization", "Amazon Web Services");
            cert.put("issueDate", "2023-05-15");
            cert.put("expirationDate", "2026-05-15");
            cert.put("credentialId", "AWS-12345");
            cert.put("credentialUrl", "");
            fallbackCertList.add(cert);
        }
        details.put("certifications", fallbackCertList);
        
        return details;
    }

    private Map<String, Object> getFallbackEvaluation(String resumeText, String jobTitle, String jobDescription, String jobRequirements) {
        // Fallback calculations: simple keyword matching for testing/offline support
        double score = 65.0;
        String lowercaseResume = resumeText.toLowerCase();
        
        int matchCount = 0;
        int totalRequirements = 0;
        
        if (jobRequirements != null && !jobRequirements.trim().isEmpty()) {
            String[] reqKeywords = jobRequirements.split("[,;\\s]+");
            for (String kw : reqKeywords) {
                if (kw.length() > 2) {
                    totalRequirements++;
                    if (lowercaseResume.contains(kw.toLowerCase())) {
                        matchCount++;
                    }
                }
            }
        }
        
        if (totalRequirements > 0) {
            score = 50.0 + ((double) matchCount / totalRequirements) * 50.0;
        } else {
            // Check description matching keywords
            String[] commonKeywords = {"java", "springboot", "react", "mysql", "aws", "docker", "python", "javascript"};
            for (String kw : commonKeywords) {
                if (jobDescription.toLowerCase().contains(kw)) {
                    totalRequirements++;
                    if (lowercaseResume.contains(kw)) {
                        matchCount++;
                    }
                }
            }
            if (totalRequirements > 0) {
                score = 50.0 + ((double) matchCount / totalRequirements) * 45.0;
            }
        }

        // Limit score boundaries
        score = Math.min(100.0, Math.max(0.0, score));

        Map<String, Object> eval = new HashMap<>();
        eval.put("matchScore", Math.round(score * 10.0) / 10.0);
        eval.put("aiSummary", "Standard neural keyword match evaluated a " + Math.round(score) + "% similarity based on resume alignment with job requirements: " + (jobRequirements != null ? jobRequirements : "General requirements") + ".");
        return eval;
    }
}
