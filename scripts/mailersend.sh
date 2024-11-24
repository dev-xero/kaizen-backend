#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [-k API_KEY]"
    echo "  -k API_KEY : MailerSend API key"
    echo ""
    echo "If no API key is provided via flag, script will try to read MAILERSEND_API_KEY from .env file"
    exit 1
}

# Get API key from command line flag or .env file
API_KEY=""

# Parse command line arguments
while getopts "k:h" opt; do
    case $opt in
        k) API_KEY="$OPTARG"
        ;;
        h) show_usage
        ;;
        ?) show_usage
        ;;
    esac
done

# If no API key provided via flag, try to load from .env
if [ -z "$API_KEY" ]; then
    if [ -f .env ]; then
        source .env
        API_KEY=$MAILERSEND_API_KEY
    fi
fi

# Check if an API key is present
if [ -z "$API_KEY" ]; then
    echo "Error: No API key provided"
    echo "Please either:"
    echo "  1. Use -k flag: $0 -k your_api_key"
    echo "  2. Create a .env file with MAILERSEND_API_KEY=your_api_key"
    exit 1
fi

BASE_URL="https://api.mailersend.com/v1"

total_processed=0
successful_deletions=0
failed_deletions=0
page=1

# Function to fetch recipients
get_recipients() {
    local page=$1
    curl -s -X GET \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        "$BASE_URL/recipients?page=$page&limit=100"
}

# Function to delete a recipient
delete_recipient() {
    local recipient_id=$1
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X DELETE \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        "$BASE_URL/recipients/$recipient_id")
    
    if [ "$http_code" -eq 204 ]; then
        return 0
    else
        return 1
    fi
}

echo "Starting recipient deletion process..."

while true; do
    # Get recipients for current page
    response=$(get_recipients $page)
    recipients=$(echo "$response" | jq -r '.data[]?.id')
    
    if [ -z "$recipients" ]; then
        break
    fi
    
    echo "Processing page $page..."
    
    # Process each recipient
    while read -r recipient_id; do
        if [ ! -z "$recipient_id" ]; then
            ((total_processed++))
            
            if delete_recipient "$recipient_id"; then
                ((successful_deletions++))
                echo "Successfully deleted recipient: $recipient_id"
            else
                ((failed_deletions++))
                echo "Failed to delete recipient: $recipient_id"
            fi
            
            # Rate limiting - sleep for 1 second between requests
            sleep 1
        fi
    done <<< "$recipients"
    
    ((page++))
done

echo ""
echo "Deletion Completed, stats:"
echo -e "- Total recipients processed: $total_processed"
echo -e "- Successfully deleted: $successful_deletions"
echo -e "- Failed deletions: $failed_deletions"